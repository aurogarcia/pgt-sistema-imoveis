import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Link,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('admin@pgt-system.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulação de login (já que o backend tem problemas de DB)
      if (email === 'admin@pgt-system.com' && password === 'admin123') {
        const mockUser = {
          id: '1',
          email: 'admin@pgt-system.com',
          fullName: 'Administrador do Sistema',
          cpfCnpj: '12345678901',
          userType: 'admin' as const,
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        const mockTokens = {
          accessToken: 'mock_token_123',
          refreshToken: 'mock_refresh_123',
          expiresIn: '24h'
        };

        login(mockUser, mockTokens);
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas. Use: admin@pgt-system.com / admin123');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@pgt-system.com');
    setPassword('admin123');
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo/Título */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4, 
            p: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <BusinessIcon sx={{ fontSize: '3rem', mb: 2, color: 'white' }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
              MedidaGeo
            </Typography>
            <Typography variant="subtitle1" color="rgba(255,255,255,0.8)">
              Acesso ao Sistema PGT
            </Typography>
          </Box>

          {/* Card de Login */}
          <Card sx={{ width: '100%', maxWidth: 400 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography component="h2" variant="h5" align="center" sx={{ mb: 3 }}>
                Entrar na sua conta
              </Typography>

              {/* Demo Alert */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Demo:</strong> Use admin@pgt-system.com / admin123 ou clique em "Login Demo"
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={<LoginIcon />}
                  sx={{ mb: 2, py: 1.2 }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  onClick={handleDemoLogin}
                  startIcon={<PersonAddIcon />}
                  sx={{ mb: 2 }}
                >
                  Login Demo
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    ou
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Link href="#" variant="body2" sx={{ mr: 2 }}>
                    Esqueceu a senha?
                  </Link>
                  <Link href="/register" variant="body2">
                    Criar conta
                  </Link>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              MedidaGeo - Engenharia e Georreferenciamento
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ mt: 1, display: 'block' }}>
              Sistema PGT para gestão de propriedades rurais e urbanas • Tecnologia IA
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}