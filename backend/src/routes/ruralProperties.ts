import express from 'express';
const router = express.Router();

// TODO: Implementar rotas de propriedades rurais
router.get('/', (req, res) => {
  res.json({ message: 'Rural properties routes - TODO' });
});

export default router;