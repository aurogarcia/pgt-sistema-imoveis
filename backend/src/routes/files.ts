import express from 'express';
const router = express.Router();

// TODO: Implementar rotas de arquivos
router.get('/', (req, res) => {
  res.json({ message: 'Files routes - TODO' });
});

export default router;