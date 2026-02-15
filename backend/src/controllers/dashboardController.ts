import { Request, Response } from 'express';
import { mockDatabase } from '../models';
import { logger } from '../utils/logger';

export const dashboardController = {
  // Estatísticas gerais do dashboard
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Filtrar propriedades do usuário
      const userRuralProperties = mockDatabase.ruralProperties.filter(p => p.ownerId === userId);
      const userUrbanProperties = mockDatabase.urbanProperties.filter(p => p.ownerId === userId);

      // Calcular estatísticas
      const stats = {
        totalRuralProperties: userRuralProperties.length,
        totalUrbanProperties: userUrbanProperties.length,
        totalProperties: userRuralProperties.length + userUrbanProperties.length,
        
        // Status das propriedades
        regularProperties: [
          ...userRuralProperties.filter(p => p.regularizationStatus === 'regular'),
          ...userUrbanProperties.filter(p => p.regularizationStatus === 'regular')
        ].length,
        
        irregularProperties: [
          ...userRuralProperties.filter(p => p.regularizationStatus === 'irregular'),
          ...userUrbanProperties.filter(p => p.regularizationStatus === 'irregular')
        ].length,
        
        pendingProperties: [
          ...userRuralProperties.filter(p => p.regularizationStatus === 'pending'),
          ...userUrbanProperties.filter(p => p.regularizationStatus === 'pending')
        ].length,

        // Estatísticas rurais específicas
        ruralStats: {
          totalAreaHectares: userRuralProperties.reduce((sum, p) => sum + p.totalAreaHectares, 0),
          productiveAreaHectares: userRuralProperties.reduce((sum, p) => sum + (p.productiveAreaHectares || 0), 0),
          withEnvironmentalLicense: userRuralProperties.filter(p => p.hasEnvironmentalLicense).length,
          withCAR: userRuralProperties.filter(p => p.carCode).length,
          withLegalReserve: userRuralProperties.filter(p => p.hasLegalReserve).length
        },

        // Estatísticas urbanas específicas
        urbanStats: {
          totalLandAreaM2: userUrbanProperties.reduce((sum, p) => sum + p.landAreaM2, 0),
          totalBuiltAreaM2: userUrbanProperties.reduce((sum, p) => sum + (p.builtAreaM2 || 0), 0),
          eligibleForREURBSocial: userUrbanProperties.filter(p => 
            p.reurb.modalityType === 'social' && p.reurb.hasPossession
          ).length,
          withIPTU: userUrbanProperties.filter(p => p.iptuRegistration).length,
          withInfrastructure: userUrbanProperties.filter(p => p.reurb.hasInfrastructure).length
        },

        // Atividades recentes (simuladas)
        recentActivity: [
          {
            id: '1',
            type: 'property_created',
            title: 'Nova propriedade cadastrada',
            description: userRuralProperties.length > 0 ? 
              `Propriedade rural "${userRuralProperties[0].propertyName}" adicionada` :
              'Propriedade adicionada ao sistema',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            propertyId: userRuralProperties.length > 0 ? userRuralProperties[0].id : null
          },
          {
            id: '2',
            type: 'status_changed',
            title: 'Status de regularização atualizado',
            description: 'Propriedade teve seu status de conformidade atualizado',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            propertyId: (userRuralProperties.length + userUrbanProperties.length) > 0 ? 
              (userRuralProperties[0]?.id || userUrbanProperties[0]?.id) : null
          }
        ]
      };

      logger.info('Dashboard stats obtidas', { userId, totalProperties: stats.totalProperties });

      res.json(stats);

    } catch (error) {
      logger.error('Erro ao obter estatísticas do dashboard:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Comparativo entre estados (RJ vs ES)
  async getStateComparison(req: Request, res: Response) {
    try {
      // Simular dados comparativos entre RJ e ES
      const stateComparison = {
        rj: {
          state: 'RJ',
          totalProperties: 1847,
          ruralProperties: 1205,
          urbanProperties: 642,
          regularProperties: 1298,
          irregularProperties: 423,
          pendingProperties: 126,
          complianceRate: 70.3,
          averageAreaHectares: 89.5,
          withCAR: 891,
          eligibleREURB: 245
        },
        es: {
          state: 'ES',
          totalProperties: 1543,
          ruralProperties: 1089,
          urbanProperties: 454,
          regularProperties: 1167,
          irregularProperties: 284,
          pendingProperties: 92,
          complianceRate: 75.6,
          averageAreaHectares: 74.3,
          withCAR: 723,
          eligibleREURB: 189
        }
      };

      res.json(stateComparison);

    } catch (error) {
      logger.error('Erro ao obter comparativo de estados:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Gráficos e métricas para dashboard
  async getChartData(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const userRuralProperties = mockDatabase.ruralProperties.filter(p => p.ownerId === userId);
      const userUrbanProperties = mockDatabase.urbanProperties.filter(p => p.ownerId === userId);

      const chartData = {
        // Gráfico de pizza - Status das propriedades
        propertyStatusPie: {
          regular: [
            ...userRuralProperties.filter(p => p.regularizationStatus === 'regular'),
            ...userUrbanProperties.filter(p => p.regularizationStatus === 'regular')
          ].length,
          irregular: [
            ...userRuralProperties.filter(p => p.regularizationStatus === 'irregular'),
            ...userUrbanProperties.filter(p => p.regularizationStatus === 'irregular')
          ].length,
          pending: [
            ...userRuralProperties.filter(p => p.regularizationStatus === 'pending'),
            ...userUrbanProperties.filter(p => p.regularizationStatus === 'pending')
          ].length,
          in_process: [
            ...userRuralProperties.filter(p => p.regularizationStatus === 'in_process'),
            ...userUrbanProperties.filter(p => p.regularizationStatus === 'in_process')
          ].length
        },

        // Gráfico de barras - Evolution mensal (simulado)
        monthlyEvolution: [
          { month: 'Jan', rural: 2, urban: 1 },
          { month: 'Fev', rural: 3, urban: 2 },
          { month: 'Mar', rural: 1, urban: 3 },
          { month: 'Abr', rural: 4, urban: 1 },
          { month: 'Mai', rural: 2, urban: 4 },
          { month: 'Jun', rural: 5, urban: 2 }
        ],

        // Gráfico de linha - Taxa de conformidade
        complianceTimeline: [
          { date: '2024-01', rate: 45 },
          { date: '2024-02', rate: 52 },
          { date: '2024-03', rate: 48 },
          { date: '2024-04', rate: 63 },
          { date: '2024-05', rate: 71 },
          { date: '2024-06', rate: 78 }
        ],

        // Distribuição por tipo de propriedade
        propertyTypeDistribution: {
          rural: {
            farm: userRuralProperties.filter(p => p.propertyType === 'farm').length,
            ranch: userRuralProperties.filter(p => p.propertyType === 'ranch').length,
            settlement: userRuralProperties.filter(p => p.propertyType === 'settlement').length
          },
          urban: {
            residential: userUrbanProperties.filter(p => p.propertyType === 'residential').length,
            commercial: userUrbanProperties.filter(p => p.propertyType === 'commercial').length,
            industrial: userUrbanProperties.filter(p => p.propertyType === 'industrial').length,
            mixed: userUrbanProperties.filter(p => p.propertyType === 'mixed').length
          }
        }
      };

      res.json(chartData);

    } catch (error) {
      logger.error('Erro ao obter dados dos gráficos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};