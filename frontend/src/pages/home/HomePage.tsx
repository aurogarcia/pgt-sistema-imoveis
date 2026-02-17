import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { 
  Agriculture, 
  LocationCity, 
  SmartToy, 
  Assessment,
  Business,
  CheckCircle,
  Explore,
  Analytics,
  Security,
  Speed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Explore,
      title: 'Georreferenciamento',
      description: 'Medições precisas e mapeamento territorial',
      color: '#4caf50'
    },
    {
      icon: Analytics,
      title: 'Análise Espacial',
      description: 'Estudos topográficos e análises de área',
      color: '#2196f3'
    },
    {
      icon: Security,
      title: 'Regularização',
      description: 'Assessoria completa em regularização fundiária',
      color: '#ff9800'
    },
    {
      icon: Speed,
      title: 'Tecnologia IA',
      description: 'Automação e precisão em todos os processos',
      color: '#9c27b0'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          {/* Logo Moderno */}
          <Box mb={3}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.3))' }}>
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              {/* Círculo base */}
              <circle cx="60" cy="60" r="55" fill="url(#logoGrad)" fillOpacity="0.2" stroke="url(#logoGrad)" strokeWidth="2" />
              {/* Elementos geométricos modernos */}
              <circle cx="45" cy="45" r="8" fill="url(#logoGrad2)" />
              <circle cx="75" cy="45" r="6" fill="url(#logoGrad2)" fillOpacity="0.8" />
              <circle cx="60" cy="75" r="10" fill="url(#logoGrad2)" />
              {/* Linhas conectoras */}
              <line x1="45" y1="45" x2="75" y2="45" stroke="url(#logoGrad)" strokeWidth="2" strokeOpacity="0.6" />
              <line x1="45" y1="45" x2="60" y2="75" stroke="url(#logoGrad)" strokeWidth="2" strokeOpacity="0.6" />
              <line x1="75" y1="45" x2="60" y2="75" stroke="url(#logoGrad)" strokeWidth="2" strokeOpacity="0.6" />
              {/* Símbolo central */}
              <path d="M55,55 L65,55 L65,65 L55,65 Z" fill="url(#logoGrad)" fillOpacity="0.8" />
            </svg>
          </Box>
          
          <Typography variant="h1" component="h1" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            MedidaGeo
          </Typography>
          <Typography variant="h5" color="rgba(255,255,255,0.9)" mb={2}>
            Engenharia e Georreferenciamento
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.8)" maxWidth="700px" mx="auto" mb={1}>
            Especialistas em medições rurais, topografia e regularização fundiária
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" maxWidth="600px" mx="auto">
            Tecnologia avançada ∙ Precisão cartográfica ∙ Soluções completas
          </Typography>
        </Box>

        <Grid container spacing={3} mb={6}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                    }
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Icon sx={{ fontSize: '3rem', color: feature.color, mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box 
          sx={{
            background: 'rgba(76, 175, 80, 0.2)',
            borderRadius: 3,
            p: 3,
            border: '1px solid rgba(76, 175, 80, 0.3)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            mb: 4
          }}
        >
          <CheckCircle sx={{ fontSize: '2.5rem', color: '#4caf50', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" mb={1}>
            ✅ Acesse nosso Sistema PGT
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.9)">
            Plataforma completa para gestão e regularização de propriedades
          </Typography>
        </Box>

        <Box textAlign="center">
          {user ? (
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: 3
              }}
            >
              🚀 Acessar Sistema PGT
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3
                }}
              >
                🔐 Fazer Login
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                📝 Registrar
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}