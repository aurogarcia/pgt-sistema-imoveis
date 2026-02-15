import OpenAI from 'openai';
import { logger } from '../utils/logger';
import db from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

interface DiagnosticRequest {
  propertyId: string;
  propertyType: 'rural' | 'urban';
  propertyData: any;
}

interface ChatRequest {
  userId: string;
  message: string;
  contextType?: string;
  propertyId?: string;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Gerar diagnóstico automatizado
  async generateDiagnostic(request: DiagnosticRequest) {
    try {
      const { propertyId, propertyType, propertyData } = request;
      
      // Construir prompt baseado no tipo de propriedade
      const prompt = this.buildDiagnosticPrompt(propertyType, propertyData);
      
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em regularização de imóveis rurais e urbanos no Brasil. Analise os dados fornecidos e gere um diagnóstico detalhado com recomendações práticas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Processar resposta da IA e extrair dados estruturados
      const diagnostic = this.processDiagnosticResponse(aiResponse);
      
      // Salvar diagnóstico no banco
      const diagnosticId = uuidv4();
      const result = await db.query(
        `INSERT INTO property_diagnostics (
          id, 
          ${propertyType === 'rural' ? 'rural_property_id' : 'urban_property_id'},
          diagnostic_type, title, description, overall_status, 
          compliance_score, issues, recommendations, required_documents,
          estimated_cost, estimated_timeline_days, generated_by_ai, 
          ai_confidence_score, ai_model_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          diagnosticId,
          propertyId,
          'compliance',
          diagnostic.title,
          diagnostic.description,
          diagnostic.overallStatus,
          diagnostic.complianceScore,
          JSON.stringify(diagnostic.issues),
          JSON.stringify(diagnostic.recommendations),
          diagnostic.requiredDocuments,
          diagnostic.estimatedCost,
          diagnostic.estimatedTimelineDays,
          true,
          diagnostic.confidenceScore,
          process.env.OPENAI_MODEL || 'gpt-4-turbo'
        ]
      );

      logger.info('Diagnóstico gerado com IA', {
        diagnosticId,
        propertyId,
        propertyType,
        complianceScore: diagnostic.complianceScore
      });

      return result.rows[0];
      
    } catch (error) {
      logger.error('Erro ao gerar diagnóstico com IA:', error);
      throw error;
    }
  }

  // Chat com IA para suporte
  async chatWithAI(request: ChatRequest) {
    try {
      const { userId, message, contextType, propertyId } = request;
      
      // Buscar contexto da conversa se existir
      let conversationContext = '';
      if (propertyId) {
        // Buscar dados da propriedade para contexto
        const propertyData = await this.getPropertyContext(propertyId);
        conversationContext = `Contexto da propriedade: ${JSON.stringify(propertyData)}`;
      }
      
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em regularização de imóveis rurais e urbanos no Brasil. 
                     Você ajuda usuários com dúvidas sobre:
                     - CAR (Cadastro Ambiental Rural)
                     - REURB (Regularização Fundiária Urbana)
                     - IRTR (Imposto Territorial Rural)
                     - Documentação necessária
                     - Processos de regularização
                     - Legislação aplicável
                     
                     Seja prático, claro e sempre indique os próximos passos.
                     ${conversationContext}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
        temperature: 0.4,
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Salvar conversa no banco
      await this.saveConversation(userId, message, aiResponse, contextType, propertyId);
      
      return {
        response: aiResponse,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Erro no chat com IA:', error);
      throw error;
    }
  }

  private buildDiagnosticPrompt(propertyType: string, propertyData: any): string {
    if (propertyType === 'rural') {
      return `
        Analise esta propriedade rural e gere um diagnóstico de regularização:
        
        Dados da propriedade:
        - Nome: ${propertyData.propertyName || 'Não informado'}
        - Estado: ${propertyData.state}
        - Município: ${propertyData.municipality}
        - Área total: ${propertyData.totalAreaHectares} hectares
        - Tipo de propriedade: ${propertyData.propertyType}
        - Código CAR: ${propertyData.carCode || 'Não cadastrado'}
        - Código SIGEF: ${propertyData.sigefCode || 'Não cadastrado'}
        - Licença ambiental: ${propertyData.hasEnvironmentalLicense ? 'Sim' : 'Não'}
        - Reserva legal: ${propertyData.hasLegalReserve ? 'Sim' : 'Não'}
        - APP: ${propertyData.hasPermanentPreservationArea ? 'Sim' : 'Não'}
        
        Por favor, analise e retorne um JSON com:
        {
          "title": "Título do diagnóstico",
          "description": "Descrição detalhada",
          "overallStatus": "regular|irregular|pending|in_process",
          "complianceScore": 0-100,
          "issues": ["lista de problemas encontrados"],
          "recommendations": ["lista de recomendações"],
          "requiredDocuments": ["documentos necessários"],
          "estimatedCost": valor estimado em reais,
          "estimatedTimelineDays": prazo em dias,
          "confidenceScore": 0-100
        }
      `;
    } else {
      return `
        Analise esta propriedade urbana para REURB:
        
        Dados da propriedade:
        - Nome: ${propertyData.propertyName || 'Não informado'}
        - Estado: ${propertyData.state}
        - Município: ${propertyData.municipality}
        - Endereço: ${propertyData.streetAddress}
        - Área do terreno: ${propertyData.landAreaM2} m²
        - Tipo: ${propertyData.propertyType}
        - REURB: ${propertyData.reurbModality || 'Não iniciado'}
        - Infraestrutura: Energia:${propertyData.hasElectricity ? 'Sim' : 'Não'}, Água:${propertyData.hasWaterSupply ? 'Sim' : 'Não'}
        
        Analise segundo a Lei 13.465/2017 e retorne um JSON com a mesma estrutura da propriedade rural.
      `;
    }
  }

  private processDiagnosticResponse(aiResponse: string | null): any {
    try {
      if (!aiResponse) throw new Error('Resposta vazia da IA');
      
      // Tentar extrair JSON da resposta
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: criar estrutura básica
      return {
        title: 'Diagnóstico Automatizado',
        description: aiResponse,
        overallStatus: 'pending',
        complianceScore: 50,
        issues: ['Necessita análise detalhada'],
        recommendations: ['Consulte um especialista'],
        requiredDocuments: ['Documentação básica'],
        estimatedCost: 0,
        estimatedTimelineDays: 30,
        confidenceScore: 70
      };
      
    } catch (error) {
      logger.error('Erro ao processar resposta da IA:', error);
      throw error;
    }
  }

  private async getPropertyContext(propertyId: string): Promise<any> {
    try {
      // Tentar buscar como propriedade rural primeiro
      let result = await db.query(
        'SELECT * FROM rural_properties WHERE id = $1',
        [propertyId]
      );
      
      if (result.rows.length > 0) {
        return { type: 'rural', data: result.rows[0] };
      }
      
      // Buscar como propriedade urbana
      result = await db.query(
        'SELECT * FROM urban_properties WHERE id = $1',
        [propertyId]
      );
      
      if (result.rows.length > 0) {
        return { type: 'urban', data: result.rows[0] };
      }
      
      return null;
    } catch (error) {
      logger.error('Erro ao buscar contexto da propriedade:', error);
      return null;
    }
  }

  private async saveConversation(userId: string, userMessage: string, aiResponse: string | null, contextType?: string, propertyId?: string) {
    try {
      const conversationId = uuidv4();
      const messages = [
        {
          id: uuidv4(),
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        },
        {
          id: uuidv4(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ];

      await db.query(
        `INSERT INTO ai_conversations (
          id, user_id, context_type, rural_property_id, urban_property_id,
          messages, total_messages
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          conversationId,
          userId,
          contextType,
          propertyId,
          null, // Por simplicidade, assumindo rural. Em produção, determinar o tipo
          JSON.stringify(messages),
          2
        ]
      );
      
    } catch (error) {
      logger.error('Erro ao salvar conversa:', error);
      // Não lançar erro para não quebrar o fluxo principal
    }
  }
}

export const aiService = new AIService();