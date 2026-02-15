import express from 'express';
import { ruralPropertiesController } from '../controllers/ruralPropertiesController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Rotas de propriedades rurais
router.get('/', ruralPropertiesController.getAll);
router.get('/:id', ruralPropertiesController.getById);
router.post('/', ruralPropertiesController.create);
router.put('/:id', ruralPropertiesController.update);
router.delete('/:id', ruralPropertiesController.delete);
router.get('/:id/dashboard', ruralPropertiesController.getDashboard);

export default router;