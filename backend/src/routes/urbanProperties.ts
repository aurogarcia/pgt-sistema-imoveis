import express from 'express';
import { urbanPropertiesController } from '../controllers/urbanPropertiesController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Rotas de propriedades urbanas
router.get('/', urbanPropertiesController.getAll);
router.get('/:id', urbanPropertiesController.getById);
router.post('/', urbanPropertiesController.create);
router.put('/:id', urbanPropertiesController.update);
router.delete('/:id', urbanPropertiesController.delete);
router.get('/:id/dashboard', urbanPropertiesController.getDashboard);

export default router;