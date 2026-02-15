import express from 'express';
const router = express.Router();

// TODO: Implementar rotas de diagnósticos
router.get('/', (req, res) => {
  res.json({ message: 'Diagnostics routes - TODO' });
});

export default router;