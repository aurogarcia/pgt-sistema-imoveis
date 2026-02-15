import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  changePassword,
  deactivateAccount,
  changeUserType,
  toggleUserStatus
} from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate, validateParams, uuidSchema } from '../utils/validation';
import Joi from 'joi';

const router = express.Router();

// Schema para atualização de perfil
const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().pattern(/^\d{10,11}$/).optional(),
  address: Joi.string().max(500).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().length(2).optional(),
  zipCode: Joi.string().pattern(/^\d{8}$/).optional(),
  professionalRegister: Joi.string().max(50).optional(),
  specialization: Joi.array().items(Joi.string()).optional()
});

// Schema para alteração de senha
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
    'string.pattern.base': 'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
  })
});

// Schema para alteração de tipo de usuário
const changeUserTypeSchema = Joi.object({
  userType: Joi.string().valid('admin', 'user', 'agent', 'viewer').required()
});

// Schema para alteração de status
const toggleStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
});

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todos os usuários (apenas admin)
/**
 * @route   GET /api/users
 * @desc    Listar todos os usuários com paginação e filtros
 * @access  Private (Admin only)
 * @query   page, limit, search, userType, isActive
 */
router.get('/',
  requireAdmin,
  getAllUsers
);

// Obter usuário por ID
/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Private (Own data or Admin)
 */
router.get('/:id',
  validateParams(uuidSchema),
  getUserById
);

// Atualizar perfil
/**
 * @route   PUT /api/users/profile
 * @desc    Atualizar perfil do usuário logado
 * @access  Private
 */
router.put('/profile',
  validate(updateProfileSchema),
  updateProfile
);

// Alterar senha
/**
 * @route   PUT /api/users/change-password
 * @desc    Alterar senha do usuário
 * @access  Private
 */
router.put('/change-password',
  validate(changePasswordSchema),
  changePassword
);

// Desativar própria conta
/**
 * @route   DELETE /api/users/deactivate
 * @desc    Desativar própria conta
 * @access  Private
 */
router.delete('/deactivate',
  deactivateAccount
);

// Admin: Alterar tipo de usuário
/**
 * @route   PUT /api/users/:id/user-type
 * @desc    Alterar tipo de usuário (admin apenas)
 * @access  Private (Admin only)
 */
router.put('/:id/user-type',
  requireAdmin,
  validateParams(uuidSchema),
  validate(changeUserTypeSchema),
  changeUserType
);

// Admin: Ativar/Desativar usuário
/**
 * @route   PUT /api/users/:id/status
 * @desc    Alterar status do usuário (admin apenas)
 * @access  Private (Admin only)
 */
router.put('/:id/status',
  requireAdmin,
  validateParams(uuidSchema),
  validate(toggleStatusSchema),
  toggleUserStatus
);

export default router;