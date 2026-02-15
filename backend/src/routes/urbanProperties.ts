import express from 'express';
const router = express.Router();

// TODO: Implementar rotas de propriedades urbanas
router.get('/', (req, res) => {
  res.json({ message: 'Urban properties routes - TODO' });
});

export default router;