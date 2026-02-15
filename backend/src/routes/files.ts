import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  uploadFiles,
  getFiles,
  getFileById,
  downloadFile,
  deleteFile,
  getFileStats
} from '../controllers/fileController';

const router = express.Router();

// Middleware: todas as rotas requerem autenticação
router.use(authenticate);

// Upload de arquivos
router.post('/upload', uploadFiles);

// Listar arquivos (com filtros opcionais)
router.get('/', getFiles);

// Estatísticas de arquivos
router.get('/stats', getFileStats);

// Buscar arquivo por ID
router.get('/:id', getFileById);

// Download de arquivo
router.get('/:id/download', downloadFile);

// Deletar arquivo
router.delete('/:id', deleteFile);

export default router;