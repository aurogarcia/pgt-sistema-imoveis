import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'admin@pgt-system.com',
    password: 'admin123',
    fullName: 'Administrador do Sistema',
    userType: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: new Date().toISOString()
  }
];

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development-mock',
    version: '1.0.0'
  });
});

// Login endpoint (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      error: 'Credenciais inválidas',
      code: 'INVALID_CREDENTIALS'
    });
  }

  const tokens = {
    accessToken: 'mock_access_token_' + Date.now(),
    refreshToken: 'mock_refresh_token_' + Date.now(),
    expiresIn: '24h'
  };

  res.json({
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      emailVerified: user.emailVerified
    },
    tokens
  });
});

// Profile endpoint (mock)
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token não fornecido',
      code: 'MISSING_TOKEN'
    });
  }

  const user = mockUsers[0]; // Retorna sempre o admin para mock
  
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    userType: user.userType,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    profile: {
      avatarUrl: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      professionalRegister: null,
      specialization: []
    }
  });
});

// Dashboard stats endpoint (mock)
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalProperties: 1250,
    ruralProperties: 750,
    urbanProperties: 500,
    pendingRegularizations: 340,
    completedRegularizations: 910,
    aiDiagnostics: 234,
    recentActivities: [
      {
        id: '1',
        type: 'diagnostic_generated',
        description: 'Diagnóstico automático gerado para Fazenda São José',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'property_registered',
        description: 'Nova propriedade urbana cadastrada em Vitória/ES',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  });
});

// Logout endpoint (mock)
app.post('/api/auth/logout', (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    code: 'NOT_FOUND'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor mock rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: development-mock`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 Login demo: admin@pgt-system.com / admin123`);
});

export default app;