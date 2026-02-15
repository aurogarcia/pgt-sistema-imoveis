import express from 'express';
const router = express.Router();

// TODO: Implementar rotas de integrações externas
router.get('/', (req, res) => {
  res.json({ message: 'Integrations routes - TODO' });
});

export default router;