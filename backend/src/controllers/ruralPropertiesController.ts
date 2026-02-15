import { Request, Response } from 'express';
import { mockDatabase, createId, RuralProperty } from '../models';
import { logger } from '../utils/logger';
import { ruralPropertySchema } from '../utils/validation';

export const ruralPropertiesController = {
  // Listar todas as propriedades do usuário
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      let properties = mockDatabase.ruralProperties.filter(p => p.ownerId === userId);

      // Filtrar por status se especificado
      if (status) {
        properties = properties.filter(p => p.regularizationStatus === status);
      }

      // Paginação
      const offset = (page - 1) * limit;
      const totalCount = properties.length;
      const totalPages = Math.ceil(totalCount / limit);
      const paginatedProperties = properties.slice(offset, offset + limit);

      logger.info('Propriedades rurais listadas', { userId, count: paginatedProperties.length });

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
      logger.error('Erro ao listar propriedades rurais:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Obter propriedade específica
  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const property = mockDatabase.ruralProperties.find(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (!property) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      logger.info('Propriedade rural obtida', { userId, propertyId });

      res.json(property);

    } catch (error) {
      logger.error('Erro ao obter propriedade rural:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Criar nova propriedade
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Validar dados de entrada
      const { error, value } = ruralPropertySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details.map((d: any) => ({ field: d.path.join('.'), message: d.message }))
        });
      }

      const newProperty: RuralProperty = {
        id: createId(),
        ownerId: userId,
        ...value,
        regularizationStatus: value.regularizationStatus || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDatabase.ruralProperties.push(newProperty);

      logger.info('Propriedade rural criada', { userId, propertyId: newProperty.id });

      res.status(201).json({
        message: 'Propriedade criada com sucesso',
        property: newProperty
      });

    } catch (error) {
      logger.error('Erro ao criar propriedade rural:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Atualizar propriedade
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const propertyIndex = mockDatabase.ruralProperties.findIndex(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (propertyIndex === -1) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      // Validar dados de entrada (parcial)
      const { error, value } = ruralPropertySchema.validate(req.body, { allowUnknown: true });
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details.map((d: any) => ({ field: d.path.join('.'), message: d.message }))
        });
      }

      // Atualizar propriedade
      const updatedProperty = {
        ...mockDatabase.ruralProperties[propertyIndex],
        ...value,
        updatedAt: new Date().toISOString()
      };

      mockDatabase.ruralProperties[propertyIndex] = updatedProperty;

      logger.info('Propriedade rural atualizada', { userId, propertyId });

      res.json({
        message: 'Propriedade atualizada com sucesso',
        property: updatedProperty
      });

    } catch (error) {
      logger.error('Erro ao atualizar propriedade rural:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Deletar propriedade
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const propertyIndex = mockDatabase.ruralProperties.findIndex(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (propertyIndex === -1) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      mockDatabase.ruralProperties.splice(propertyIndex, 1);

      logger.info('Propriedade rural deletada', { userId, propertyId });

      res.json({
        message: 'Propriedade deletada com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao deletar propriedade rural:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  },

  // Dashboard específico da propriedade
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const propertyId = req.params.id;

      const property = mockDatabase.ruralProperties.find(
        p => p.id === propertyId && p.ownerId === userId
      );

      if (!property) {
        return res.status(404).json({
          error: 'Propriedade não encontrada',
          code: 'PROPERTY_NOT_FOUND'
        });
      }

      // Simular dados do dashboard
      const dashboardData = {
        property: {
          id: property.id,
          name: property.propertyName,
          totalArea: property.totalAreaHectares,
          productiveArea: property.productiveAreaHectares,
          status: property.regularizationStatus
        },
        compliance: {
          overallScore: property.regularizationStatus === 'regular' ? 95 : 
                       property.regularizationStatus === 'pending' ? 65 : 45,
          environmental: {
            hasLicense: property.hasEnvironmentalLicense,
            hasPPA: property.hasPermanentPreservationArea,
            hasLegalReserve: property.hasLegalReserve,
            score: (property.hasEnvironmentalLicense ? 30 : 0) +
                   (property.hasPermanentPreservationArea ? 35 : 0) +
                   (property.hasLegalReserve ? 35 : 0)
          },
          documentation: {
            hasMatricula: !!property.matriculaNumber,
            hasCAR: !!property.carCode,
            hasCAFIR: !!property.cafirCode,
            hasSIGEF: !!property.sigefCode,
            score: (property.matriculaNumber ? 25 : 0) +
                   (property.carCode ? 25 : 0) +
                   (property.cafirCode ? 25 : 0) +
                   (property.sigefCode ? 25 : 0)
          }
        },
        infrastructure: {
          hasElectricity: property.hasElectricity,
          hasWater: property.hasWaterSupply,
          hasSewage: property.hasSewageSystem,
          accessRoad: property.accessRoadType
        },
        recommendations: [
          ...(property.hasEnvironmentalLicense ? [] : ['Obter licença ambiental']),
          ...(property.carCode ? [] : ['Cadastrar no CAR']),
          ...(property.hasLegalReserve ? [] : ['Regularizar reserva legal']),
          ...(property.hasPermanentPreservationArea ? [] : ['Delimitar APPs'])
        ]
      };

      res.json(dashboardData);

    } catch (error) {
      logger.error('Erro ao obter dashboard da propriedade:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};