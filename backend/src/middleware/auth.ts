import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import db from '../utils/database';

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

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Verificar se o usuário ainda existe e está ativo
    const userResult = await db.query(
      'SELECT id, email, user_type, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Usuário inativo',
        code: 'USER_INACTIVE'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      fullName: user.full_name
    };

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