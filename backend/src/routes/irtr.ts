import express from 'express';
const router = express.Router();

// TODO: Implementar rotas IRTR
router.get('/', (req, res) => {
  res.json({ message: 'IRTR routes - TODO' });
});

export default router;