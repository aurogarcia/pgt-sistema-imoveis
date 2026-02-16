
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const navigate = useNavigate();

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
              Cadastro no Sistema PGT
            </Typography>
          </Box>

          {/* Card de Registro */}
          <Card sx={{ width: '100%', maxWidth: 400 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
                Registro em Desenvolvimento
              </Typography>
              
              <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 3 }}>
                O cadastro de novos usuários está sendo implementado. 
                Por favor, entre em contato conosco para obter acesso.
              </Typography>
              
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ mb: 2 }}
                fullWidth
              >
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              MedidaGeo - Engenharia e Georreferenciamento
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ mt: 1, display: 'block' }}>
              Entre em contato para solicitar acesso ao Sistema PGT
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}