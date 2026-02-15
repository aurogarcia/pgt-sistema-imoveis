import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { mockDatabase } from '../models';

interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
  iat: number;
  exp: number;
}

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        userType: string;
        fullName: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
    
    // Verificar se o usuário ainda existe e está ativo nos dados mock
    const user = mockDatabase.users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado ou inativo',
        code: 'INVALID_USER'
      });
    }

    // Adicionar informações do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      fullName: user.fullName
    };

    // Adicionar userId diretamente para compatibilidade
    (req as any).userId = user.id;

    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'EXPIRED_TOKEN'
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação requerida',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado. Privilégios de administrador requeridos.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

export const requireUserTypes = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação requerida',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        error: 'Acesso negado. Tipo de usuário não permitido.',
        code: 'INSUFFICIENT_PERMISSIONS',
        allowedTypes
      });
    }

    next();
  };
};

// Alias para compatibilidade
export const authenticate = authenticateToken;