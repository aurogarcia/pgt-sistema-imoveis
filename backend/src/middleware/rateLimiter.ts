import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Rate limiter básico para todas as rotas
export const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por windowMs
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });

    res.status(429).json({
      error: 'Muitas tentativas. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter para autenticação (mais restritivo)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 tentativas de login por 15 minutos
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit de autenticação excedido', {
      ip: req.ip,
      email: req.body.email
    });

    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter para APIs externas
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por minuto
  message: {
    error: 'Limite de requisições para APIs externas excedido.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  }
});

// Rate limiter para upload de arquivos
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 uploads por hora
  message: {
    error: 'Limite de uploads excedido. Tente novamente em 1 hora.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  }
});