import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Schemas de validação

// Schema para registro de usuário
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
    'string.min': 'Senha deve ter pelo menos 8 caracteres',
    'string.pattern.base': 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
    'any.required': 'Senha é obrigatória'
  }),
  fullName: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome não pode exceder 255 caracteres',
    'any.required': 'Nome completo é obrigatório'
  }),
  cpfCnpj: Joi.string().pattern(/^(\d{11}|\d{14})$/).required().messages({
    'string.pattern.base': 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos',
    'any.required': 'CPF/CNPJ é obrigatório'
  }),
  phone: Joi.string().pattern(/^\d{10,11}$/).optional().messages({
    'string.pattern.base': 'Telefone deve ter 10 ou 11 dígitos'
  }),
  dataProcessingConsent: Joi.boolean().valid(true).required().messages({
    'any.only': 'Consentimento para processamento de dados é obrigatório'
  })
});

// Schema para registro de usuário (alias para compatibilidade)
export const userRegistrationSchema = registerSchema;

// Schema para login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória'
  })
});

// Schema para propriedade rural
export const ruralPropertySchema = Joi.object({
  propertyName: Joi.string().min(2).max(255).required(),
  propertyType: Joi.string().valid('farm', 'sitio', 'settlement', 'indigenous_land', 'environmental_reserve').required(),
  totalAreaHectares: Joi.number().positive().required(),
  productiveAreaHectares: Joi.number().positive().max(Joi.ref('totalAreaHectares')).optional(),
  state: Joi.string().length(2).required(),
  municipality: Joi.string().min(2).max(100).required(),
  district: Joi.string().max(100).optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).optional(),
  matriculaNumber: Joi.string().max(100).optional(),
  incraCode: Joi.string().max(50).optional(),
  carCode: Joi.string().max(50).optional(),
  cafirCode: Joi.string().max(50).optional(),
  sigefCode: Joi.string().max(50).optional(),
  sncr_code: Joi.string().max(50).optional(),
  hasEnvironmentalLicense: Joi.boolean().default(false),
  hasWaterUsageGrant: Joi.boolean().default(false),
  isSettlementArea: Joi.boolean().default(false),
  mainActivity: Joi.string().max(255).optional(),
  secondaryActivities: Joi.array().items(Joi.string()).optional(),
  hasPermanentPreservationArea: Joi.boolean().default(false),
  ppaAreaHectares: Joi.number().positive().max(Joi.ref('totalAreaHectares')).optional(),
  hasLegalReserve: Joi.boolean().default(false),
  legalReserveAreaHectares: Joi.number().positive().max(Joi.ref('totalAreaHectares')).optional()
});

// Schema para propriedade urbana
export const urbanPropertySchema = Joi.object({
  propertyName: Joi.string().max(255).optional(),
  propertyType: Joi.string().valid('residential', 'commercial', 'industrial', 'mixed', 'vacant_lot').required(),
  builtAreaM2: Joi.number().positive().optional(),
  landAreaM2: Joi.number().positive().required(),
  state: Joi.string().length(2).required(),
  municipality: Joi.string().min(2).max(100).required(),
  neighborhood: Joi.string().max(100).optional(),
  streetAddress: Joi.string().required(),
  zipCode: Joi.string().pattern(/^\d{8}$/).optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).optional(),
  matriculaNumber: Joi.string().max(100).optional(),
  iptuRegistration: Joi.string().max(50).optional(),
  buildingPermit: Joi.string().max(50).optional(),
  habiteSe: Joi.string().max(50).optional(),
  reurbModality: Joi.string().valid('S', 'E').optional(),
  constructionYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
  floorsCount: Joi.number().integer().positive().default(1),
  roomsCount: Joi.number().integer().positive().optional(),
  bathroomsCount: Joi.number().integer().positive().optional(),
  parkingSpaces: Joi.number().integer().min(0).default(0)
});

// Schema para diagnóstico
export const diagnosticSchema = Joi.object({
  ruralPropertyId: Joi.string().uuid().optional(),
  urbanPropertyId: Joi.string().uuid().optional(),
  diagnosticType: Joi.string().valid('IRTR', 'compliance', 'environmental', 'regularization').required(),
  title: Joi.string().min(5).max(255).required(),
  description: Joi.string().optional(),
  overallStatus: Joi.string().valid('regular', 'irregular', 'pending', 'in_process', 'blocked').required(),
  complianceScore: Joi.number().min(0).max(100).optional(),
  issues: Joi.object().optional(),
  recommendations: Joi.object().optional(),
  requiredDocuments: Joi.array().items(Joi.string()).optional(),
  estimatedCost: Joi.number().positive().optional(),
  estimatedTimelineDays: Joi.number().integer().positive().optional()
}).xor('ruralPropertyId', 'urbanPropertyId');

// Middleware de validação
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

// Validação de parâmetros da URL
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Parâmetros inválidos',
        code: 'PARAMS_VALIDATION_ERROR',
        details: errors
      });
    }

    req.params = value;
    next();
  };
};

// Schema para validação de UUID
export const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido'
  })
});