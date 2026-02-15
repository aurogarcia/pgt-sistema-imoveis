import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let code = err.code || 'INTERNAL_ERROR';

  // Log do erro
  logger.error('Error Handler:', {
    error: err,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null
  });

  // Tratar erros específicos do PostgreSQL
  if (err.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Recurso já existe';
    code = 'DUPLICATE_RESOURCE';
  }

  if (err.message.includes('foreign key constraint')) {
    statusCode = 400;
    message = 'Referência inválida';
    code = 'INVALID_REFERENCE';
  }

  if (err.message.includes('not-null constraint')) {
    statusCode = 400;
    message = 'Campo obrigatório não fornecido';
    code = 'MISSING_REQUIRED_FIELD';
  }

  // Tratar erros de validação do Joi
  if (err.message.includes('ValidationError')) {
    statusCode = 400;
    message = 'Dados inválidos fornecidos';
    code = 'VALIDATION_ERROR';
  }

  // Não expor detalhes internos em produção
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Erro interno do servidor';
    code = 'INTERNAL_ERROR';
  }

  res.status(statusCode).json({
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Classe para erros customizados
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}