import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimiter';
import { validate } from '../utils/validation';
import { userRegistrationSchema, loginSchema } from '../utils/validation';

const router = express.Router();

// Registrar novo usuário
/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', 
  authRateLimit,
  validate(userRegistrationSchema),
  register
);

// Login
/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário
 * @access  Public
 */
router.post('/login',
  authRateLimit,
  validate(loginSchema),
  login
);

// Logout
/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout do usuário
 * @access  Private
 */
router.post('/logout',
  authenticateToken,
  logout
);

// Renovar token
/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token
 * @access  Public
 */
router.post('/refresh',
  refreshToken
);

// Obter perfil do usuário
/**
 * @route   GET /api/auth/profile
 * @desc    Obter informações do usuário logado
 * @access  Private
 */
router.get('/profile',
  authenticateToken,
  getProfile
);

export default router;