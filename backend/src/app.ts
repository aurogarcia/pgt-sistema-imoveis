import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Importar middlewares
import { errorHandler } from './middleware/errorHandler';
import { basicRateLimit } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { auditLogger } from './middleware/auditLogger';

// Importar rotas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import ruralPropertyRoutes from './routes/ruralProperties';
import urbanPropertyRoutes from './routes/urbanProperties';
import diagnosticRoutes from './routes/diagnostics';
import irtrRoutes from './routes/irtr';
import aiRoutes from './routes/ai';
import fileRoutes from './routes/files';
import integrationRoutes from './routes/integrations';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(basicRateLimit);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging de auditoria
app.use(auditLogger);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rural-properties', ruralPropertyRoutes);
app.use('/api/urban-properties', urbanPropertyRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/irtr', irtrRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/integrations', integrationRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check disponível em: http://localhost:${PORT}/health`);
});

export default app;