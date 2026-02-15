import express from 'express';
const router = express.Router();

// TODO: Implementar rotas de IA
router.get('/', (req, res) => {
  res.json({ message: 'AI routes - TODO' });
});

export default router;