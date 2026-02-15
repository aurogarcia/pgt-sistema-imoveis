import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../utils/databaseManager';
import { User, UserProfile, createId } from '../models';
import { logger } from '../utils/logger';
import { registerSchema, loginSchema } from '../utils/validation';

// Interface para payload do JWT
interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

// Registrar novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    // Validar dados de entrada
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map((d: any) => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { email, password, fullName, cpfCnpj, phone, dataProcessingConsent } = value;

    // Verificar se usuário já existe
    const existingUserByEmail = await db.getUserByEmail(email);
    
    if (existingUserByEmail) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash da senha
    const passwordHash = await bcryptjs.hash(password, 10);

    // Criar usuário
    const newUser = await db.createUser({
      email,
      passwordHash,
      fullName,
      cpfCnpj,
      phone,
      userType: 'user',
      isActive: true,
      emailVerified: false,
      dataProcessingConsent,
      consentDate: dataProcessingConsent ? new Date().toISOString() : null
    });

    // Criar perfil básico (removido temporariamente - será implementado com PostgreSQL)
    /* 
    const newProfile: UserProfile = {
      id: createId(),
      userId: newUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDatabase.userProfiles.push(newProfile);
    */

    // Gerar tokens
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET || 'default_secret'
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
    );

    logger.info('Usuário registrado:', { userId: newUser.id, email: newUser.email });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        cpfCnpj: newUser.cpfCnpj,
        phone: newUser.phone,
        userType: newUser.userType,
        isActive: newUser.isActive,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRATION || '24h'
      }
    });

  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response) => {
  try {
    // Validar dados de entrada
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map((d: any) => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { email, password } = value;

    // Buscar usuário  
    const user = await db.getUserByEmail(email);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar senha
    const isValidPassword = await bcryptjs.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Atualizar último login (só em mock - no PostgreSQL seria uma query UPDATE)
    if (!db.isUsingPostgreSQL()) {
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
    }

    // Buscar perfil (temporariamente removido)
    // const profile = mockDatabase.userProfiles.find(p => p.userId === user.id);

    // Gerar tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'default_secret'
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
    );

    logger.info('Login realizado:', { userId: user.id, email: user.email });

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        cpfCnpj: user.cpfCnpj,
        phone: user.phone,
        userType: user.userType,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRATION || '24h'
      }
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
};

// Obter informações do usuário logado
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // const profile = mockDatabase.userProfiles.find(p => p.userId === user.id);

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      cpfCnpj: user.cpfCnpj,
      phone: user.phone,
      userType: user.userType,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    });

  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Renovar token de acesso
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh token requerido',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret') as Pick<JwtPayload, 'userId'>;
    
    // Verificar se usuário ainda existe e está ativo
    const user = await db.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Usuário inválido ou inativo',
        code: 'INVALID_USER'
      });
    }

    // Gerar novo access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'default_secret'
    );

    res.json({
      accessToken,
      expiresIn: process.env.JWT_EXPIRATION || '24h'
    });

  } catch (error) {
    return res.status(401).json({
      error: 'Refresh token inválido',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};