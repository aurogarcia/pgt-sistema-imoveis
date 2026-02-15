import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/database';
import { logger } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';

// Listar todos os usuários (apenas admin)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search as string;
  const userType = req.query.userType as string;
  const isActive = req.query.isActive as string;

  let query = `
    SELECT u.id, u.email, u.full_name, u.cpf_cnpj, u.user_type, 
           u.is_active, u.email_verified, u.created_at, u.last_login,
           COUNT(*) OVER() as total_count
    FROM users u
    WHERE 1=1
  `;
  
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (userType) {
    query += ` AND u.user_type = $${paramIndex}`;
    queryParams.push(userType);
    paramIndex++;
  }

  if (isActive !== undefined) {
    query += ` AND u.is_active = $${paramIndex}`;
    queryParams.push(isActive === 'true');
    paramIndex++;
  }

  query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  const result = await db.query(query, queryParams);
  const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    users: result.rows.map((user: any) => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      cpfCnpj: user.cpf_cnpj,
      userType: user.user_type,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLogin: user.last_login
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Obter usuário por ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT u.id, u.email, u.full_name, u.cpf_cnpj, u.phone, u.user_type, 
            u.is_active, u.email_verified, u.created_at, u.last_login,
            up.avatar_url, up.address, up.city, up.state, up.zip_code, 
            up.professional_register, up.specialization
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  // Verificar permissões: usuário pode ver seus próprios dados ou admin pode ver qualquer um
  if (req.user!.userType !== 'admin' && req.user!.id !== user.id) {
    throw new AppError('Acesso negado', 403, 'ACCESS_DENIED');
  }

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

// Atualizar perfil do usuário
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    phone,
    address,
    city,
    state,
    zipCode,
    professionalRegister,
    specialization
  } = req.body;

  const userId = req.user!.id;

  await db.transaction(async (client) => {
    // Atualizar dados básicos do usuário
    if (fullName || phone) {
      await client.query(
        'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [fullName, phone, userId]
      );
    }

    // Atualizar perfil detalhado
    await client.query(
      `UPDATE user_profiles 
       SET address = COALESCE($1, address),
           city = COALESCE($2, city),
           state = COALESCE($3, state),
           zip_code = COALESCE($4, zip_code),
           professional_register = COALESCE($5, professional_register),
           specialization = COALESCE($6, specialization),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7`,
      [address, city, state, zipCode, professionalRegister, specialization, userId]
    );
  });

  logger.info('Perfil de usuário atualizado', { userId });

  res.json({
    message: 'Perfil atualizado com sucesso'
  });
});

// Alterar senha
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  // Verificar senha atual
  const result = await db.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  const user = result.rows[0];
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isCurrentPasswordValid) {
    throw new AppError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Hash da nova senha
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Atualizar senha
  await db.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newPasswordHash, userId]
  );

  logger.info('Senha alterada', { userId });

  res.json({
    message: 'Senha alterada com sucesso'
  });
});

// Desativar conta (soft delete)
export const deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await db.query(
    'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );

  logger.info('Conta desativada pelo usuário', { userId });

  res.json({
    message: 'Conta desativada com sucesso'
  });
});

// Admin: Alterar tipo de usuário
export const changeUserType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userType } = req.body;

  const validUserTypes = ['admin', 'user', 'agent', 'viewer'];
  if (!validUserTypes.includes(userType)) {
    throw new AppError('Tipo de usuário inválido', 400, 'INVALID_USER_TYPE');
  }

  // Verificar se usuário existe
  const userExists = await db.query(
    'SELECT id, email, full_name FROM users WHERE id = $1',
    [id]
  );

  if (userExists.rows.length === 0) {
    throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }

  // Atualizar tipo de usuário
  await db.query(
    'UPDATE users SET user_type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [userType, id]
  );

  const user = userExists.rows[0];
  
  logger.info('Tipo de usuário alterado por admin', {
    adminId: req.user!.id,
    targetUserId: id,
    newUserType: userType
  });

  // Notificar usuário por email
  sendEmail({
    to: user.email,
    subject: 'Alteração no seu perfil - Sistema PGT',
    template: 'user_type_changed',
    data: {
      fullName: user.full_name,
      newUserType: userType
    }
  }).catch(err => logger.error('Erro ao enviar email de alteração:', err));

  res.json({
    message: 'Tipo de usuário alterado com sucesso'
  });
});

// Admin: Ativar/Desativar usuário
export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Verificar se usuário existe
  const userExists = await db.query(
    'SELECT id, email, full_name, is_active FROM users WHERE id = $1',
    [id]
  );

  if (userExists.rows.length === 0) {
    throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }

  const user = userExists.rows[0];

  // Atualizar status
  await db.query(
    'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [isActive, id]
  );

  logger.info('Status de usuário alterado por admin', {
    adminId: req.user!.id,
    targetUserId: id,
    newStatus: isActive
  });

  // Notificar usuário por email se foi desativado
  if (!isActive && user.is_active) {
    sendEmail({
      to: user.email,
      subject: 'Conta desativada - Sistema PGT',
      template: 'account_deactivated',
      data: {
        fullName: user.full_name
      }
    }).catch(err => logger.error('Erro ao enviar email de desativação:', err));
  }

  res.json({
    message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`
  });
});