import { Request, Response } from 'express';
import { mockDatabase, createId, UrbanProperty } from '../models';
import { logger } from '../utils/logger';
import { urbanPropertySchema } from '../utils/validation';

export const urbanPropertiesController = {
  // Listar todas as propriedades urbanas do usuário
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      let properties = mockDatabase.urbanProperties.filter(p => p.ownerId === userId);

      // Filtrar por status se especificado
      if (status) {
        properties = properties.filter(p => p.regularizationStatus === status);
      }

      // Paginação
      const offset = (page - 1) * limit;
      const totalCount = properties.length;
      const totalPages = Math.ceil(totalCount / limit);
      const paginatedProperties = properties.slice(offset, offset + limit);

      logger.info('Propriedades urbanas listadas', { userId, count: paginatedProperties.length });

      res.json({
        items: paginatedProperties,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      logger.error('Erro ao listar propriedades urbanas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Obter propriedade urbana específica
  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const property = mockDatabase.urbanProperties.find(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (!property) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      logger.info('Propriedade urbana obtida', { userId, propertyId });

      res.json(property);

    } catch (error) {
      logger.error('Erro ao obter propriedade urbana:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Criar nova propriedade urbana
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Validar dados de entrada
      const { error, value } = urbanPropertySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details.map((d: any) => ({ field: d.path.join('.'), message: d.message }))
        });
      }

      const newProperty: UrbanProperty = {
        id: createId(),
        ownerId: userId,
        ...value,
        regularizationStatus: value.regularizationStatus || 'pending',
        reurb: value.reurb || {
          hasPossession: false,
          hasInfrastructure: false,
          hasUrbanServices: false,
          isInRiskArea: false,
          isInEnvironmentalProtectionArea: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDatabase.urbanProperties.push(newProperty);

      logger.info('Propriedade urbana criada', { userId, propertyId: newProperty.id });

      res.status(201).json({
        message: 'Propriedade urbana criada com sucesso',
        property: newProperty
      });

    } catch (error) {
      logger.error('Erro ao criar propriedade urbana:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Atualizar propriedade urbana
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const propertyIndex = mockDatabase.urbanProperties.findIndex(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (propertyIndex === -1) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      // Validar dados de entrada (parcial)
      const { error, value } = urbanPropertySchema.validate(req.body, { allowUnknown: true });
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details.map((d: any) => ({ field: d.path.join('.'), message: d.message }))
        });
      }

      // Atualizar propriedade
      const updatedProperty = {
        ...mockDatabase.urbanProperties[propertyIndex],
        ...value,
        updatedAt: new Date().toISOString()
      };

      mockDatabase.urbanProperties[propertyIndex] = updatedProperty;

      logger.info('Propriedade urbana atualizada', { userId, propertyId });

      res.json({
        message: 'Propriedade urbana atualizada com sucesso',
        property: updatedProperty
      });

    } catch (error) {
      logger.error('Erro ao atualizar propriedade urbana:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Deletar propriedade urbana
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const propertyIndex = mockDatabase.urbanProperties.findIndex(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (propertyIndex === -1) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      mockDatabase.urbanProperties.splice(propertyIndex, 1);

      logger.info('Propriedade urbana deletada', { userId, propertyId });

      res.json({
        message: 'Propriedade urbana deletada com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao deletar propriedade urbana:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Dashboard específico da propriedade urbana
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const property = mockDatabase.urbanProperties.find(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (!property) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      // Simular dados do dashboard específico para REURB
      const dashboardData = {
        property: {
          id: property.id,
          name: property.propertyName || property.streetAddress,
          landArea: property.landAreaM2,
          builtArea: property.builtAreaM2,
          type: property.propertyType,
          status: property.regularizationStatus
        },
        reurb: {
          modalityType: property.reurb.modalityType,
          eligibilityScore: calculateREURBEligibility(property),
          requirements: {
            hasPossession: property.reurb.hasPossession,
            possessionTimeYears: property.reurb.possessionTimeYears,
            hasInfrastructure: property.reurb.hasInfrastructure,
            hasUrbanServices: property.reurb.hasUrbanServices,
            isNotInRiskArea: !property.reurb.isInRiskArea,
            isNotInEnvironmentalArea: !property.reurb.isInEnvironmentalProtectionArea
          }
        },
        compliance: {
          overallScore: property.regularizationStatus === 'regular' ? 90 : 
                       property.regularizationStatus === 'pending' ? 55 : 35,
          documentation: {
            hasMatricula: !!property.matriculaNumber,
            hasIPTU: !!property.iptuRegistration,
            hasBuildingPermit: !!property.buildingPermit,
            hasHabitationCertificate: !!property.habitationCertificate,
            score: (property.matriculaNumber ? 25 : 0) +
                   (property.iptuRegistration ? 25 : 0) +
                   (property.buildingPermit ? 25 : 0) +
                   (property.habitationCertificate ? 25 : 0)
          }
        },
        infrastructure: {
          hasElectricity: property.hasElectricity,
          hasWater: property.hasWaterSupply,
          hasSewage: property.hasSewageSystem,
          hasAsphaltedAccess: property.hasAsphaltedAccess
        },
        recommendations: generateREURBRecommendations(property)
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('Erro ao obter dashboard da propriedade urbana:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

// Função auxiliar para calcular eligibilidade para REURB
function calculateREURBEligibility(property: UrbanProperty): number {
  let score = 0;
  
  if (property.reurb.hasPossession) score += 25;
  if (property.reurb.possessionTimeYears && property.reurb.possessionTimeYears >= 5) score += 25;
  if (property.reurb.hasInfrastructure) score += 20;
  if (property.reurb.hasUrbanServices) score += 20;
  if (!property.reurb.isInRiskArea) score += 5;
  if (!property.reurb.isInEnvironmentalProtectionArea) score += 5;
  
  return Math.min(score, 100);
}

// Função auxiliar para gerar recomendações REURB
function generateREURBRecommendations(property: UrbanProperty): string[] {
  const recommendations: string[] = [];
  
  if (!property.reurb.hasPossession) {
    recommendations.push('Comprovar posse do imóvel');
  }
  
  if (!property.reurb.possessionTimeYears || property.reurb.possessionTimeYears < 5) {
    recommendations.push('Comprovar tempo de posse mínimo de 5 anos');
  }
  
  if (!property.reurb.hasInfrastructure) {
    recommendations.push('Aguardar implementação de infraestrutura urbana');
  }
  
  if (!property.iptuRegistration) {
    recommendations.push('Regularizar registro no IPTU');
  }
  
  if (!property.matriculaNumber) {
    recommendations.push('Obter matrícula do imóvel no cartório');
  }
  
  if (property.reurb.isInRiskArea) {
    recommendations.push('Avaliar e mitigar riscos ambientais');
  }
  
  if (!property.hasWaterSupply || !property.hasSewageSystem) {
    recommendations.push('Regularizar ligações de água e esgoto');
  }
  
  return recommendations;
}