import express from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Rotas do dashboard
router.get('/stats', dashboardController.getStats);
router.get('/state-comparison', dashboardController.getStateComparison);
router.get('/chart-data', dashboardController.getChartData);

export default router;