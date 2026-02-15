import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/database';
import { logger, auditLog } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Interface para payload do JWT
interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

// Registrar novo usuário
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    fullName,
    cpfCnpj,
    phone,
    dataProcessingConsent
  } = req.body;

  // Verificar se usuário já existe
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1 OR cpf_cnpj = $2',
    [email, cpfCnpj]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('Usuário já existe com este email ou CPF/CNPJ', 409, 'USER_ALREADY_EXISTS');
  }

  // Hash da senha
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Criar usuário
  const userId = uuidv4();
  const result = await db.query(
    `INSERT INTO users (id, email, password_hash, full_name, cpf_cnpj, phone, 
                       data_processing_consent, consent_date, user_type, is_active) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
     RETURNING id, email, full_name, user_type, created_at`,
    [
      userId,
      email,
      passwordHash,
      fullName,
      cpfCnpj,
      phone,
      dataProcessingConsent,
      new Date(),
      'user',
      true
    ]
  );

  const user = result.rows[0];

  // Criar perfil do usuário
  await db.query(
    'INSERT INTO user_profiles (user_id) VALUES ($1)',
    [userId]
  );

  // Gerar tokens
  const payload = { userId: user.id, email: user.email, userType: user.user_type };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

  // Log de auditoria
  auditLog('register_success', user.id, 'user', user.id, {
    email: user.email,
    userType: user.user_type
  }, req.ip);

  logger.info('Novo usuário registrado', { userId: user.id, email: user.email });

  res.status(201).json({
    message: 'Usuário registrado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      userType: user.user_type,
      createdAt: user.created_at
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: '24h'
    }
  });
});

// Login de usuário
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Buscar usuário
  const result = await db.query(
    'SELECT id, email, password_hash, full_name, user_type, is_active, email_verified FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  // Verificar se usuário está ativo
  if (!user.is_active) {
    auditLog('login_failed', user.id, 'user', user.id, {
      reason: 'user_inactive',
      email
    }, req.ip);
    
    throw new AppError('Conta desativada. Entre em contato com o suporte.', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Verificar senha
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    auditLog('login_failed', user.id, 'user', user.id, {
      reason: 'invalid_password',
      email
    }, req.ip);
    
    throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }

  // Atualizar último login
  await db.query(
    'UPDATE users SET last_login = $1 WHERE id = $2',
    [new Date(), user.id]
  );

  // Gerar tokens
  const payload = { userId: user.id, email: user.email, userType: user.user_type };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

  // Log de auditoria
  auditLog('login_success', user.id, 'user', user.id, {
    email: user.email,
    userType: user.user_type
  }, req.ip);

  logger.info('Usuário fez login', { userId: user.id, email: user.email });

  res.json({
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      userType: user.user_type,
      emailVerified: user.email_verified
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: '24h'
    }
  });
});

// Logout (adicionar token à blacklist se necessário)
export const logout = asyncHandler(async (req: Request, res: Response) => {
  auditLog('logout', req.user!.id, 'user', req.user!.id, {}, req.ip);
  
  logger.info('Usuário fez logout', { userId: req.user!.id });

  res.json({
    message: 'Logout realizado com sucesso'
  });
});

// Renovar token de acesso
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token requerido', 400, 'MISSING_REFRESH_TOKEN');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as Pick<JwtPayload, 'userId'>;
    
    // Verificar se usuário ainda existe e está ativo
    const result = await db.query(
      'SELECT id, email, user_type, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new AppError('Usuário inválido ou inativo', 401, 'INVALID_USER');
    }

    const user = result.rows[0];

    // Gerar novo access token
    const payload = { userId: user.id, email: user.email, userType: user.user_type };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });

    res.json({
      accessToken,
      expiresIn: '24h'
    });

  } catch (error) {
    throw new AppError('Refresh token inválido', 401, 'INVALID_REFRESH_TOKEN');
  }
});

// Obter informações do usuário logado
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await db.query(
    `SELECT u.id, u.email, u.full_name, u.cpf_cnpj, u.phone, u.user_type, 
            u.is_active, u.email_verified, u.created_at, u.last_login,
            up.avatar_url, up.address, up.city, up.state, up.zip_code, 
            up.professional_register, up.specialization
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = $1`,
    [req.user!.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    cpfCnpj: user.cpf_cnpj,
    phone: user.phone,
    userType: user.user_type,
    isActive: user.is_active,
    emailVerified: user.email_verified,
    createdAt: user.created_at,
    lastLogin: user.last_login,
    profile: {
      avatarUrl: user.avatar_url,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zip_code,
      professionalRegister: user.professional_register,
      specialization: user.specialization
    }
  });
});