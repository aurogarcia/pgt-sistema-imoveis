import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/database';
import { logger } from '../utils/logger';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';

// Mock users data
const mockUsers = [
  {
    id: '1',
    email: 'admin@pgt-system.com',
    fullName: 'Administrador Sistema',
    userType: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2', 
    email: 'user@exemplo.com',
    fullName: 'Usuário Exemplo',
    userType: 'user',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Listar todos os usuários (apenas admin)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const userType = req.query.userType as string;

  console.log('Mock: Listando usuários', { page, limit, userType });

  let filteredUsers = [...mockUsers];
  
  if (userType) {
    filteredUsers = filteredUsers.filter(user => user.userType === userType);
  }

  const startIndex = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

  res.json({
    users: paginatedUsers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredUsers.length / limit), 
      totalUsers: filteredUsers.length,
      hasNextPage: startIndex + limit < filteredUsers.length,
      hasPreviousPage: page > 1
    }
  });
});

// Buscar usuário por ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  console.log('Mock: Buscando usuário por ID', id);
  
  const user = mockUsers.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      isActive: user.isActive,
      createdAt: user.createdAt
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

  try {
    console.log('Mock: Atualizando perfil do usuário', userId, {
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      professionalRegister,
      specialization
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: userId,
        fullName: fullName || req.user!.fullName,
        email: req.user!.email,
        phone: phone || 'N/A',
        address,
        city,
        state,
        zipCode,
        professionalRegister,
        specialization
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    console.log('Mock: Alterando senha do usuário', userId);

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Desativar conta (soft delete)
export const deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    console.log('Mock: Desativando conta do usuário', userId);

    res.json({
      message: 'Conta desativada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Admin: Alterar tipo de usuário
export const changeUserType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userType } = req.body;

  const validUserTypes = ['admin', 'user', 'agent', 'viewer'];
  if (!validUserTypes.includes(userType)) {
    return res.status(400).json({ error: 'Tipo de usuário inválido' });
  }

  try {
    console.log('Mock: Alterando tipo de usuário', { id, userType, adminId: req.user!.id });

    res.json({
      message: `Tipo de usuário alterado para ${userType}`,
      user: {
        id,
        email: 'usuario@exemplo.com',
        fullName: 'Usuário Exemplo',
        userType: userType
      }
    });
  } catch (error) {
    console.error('Erro ao alterar tipo de usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Admin: Ativar/Desativar usuário
export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    console.log('Mock: Alterando status do usuário', { id, isActive, adminId: req.user!.id });

    res.json({
      message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: {
        id,
        email: 'usuario@exemplo.com',
        fullName: 'Usuário Exemplo',
        isActive: isActive
      }
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ error: 'Erro internal do servidor' });
  }
});