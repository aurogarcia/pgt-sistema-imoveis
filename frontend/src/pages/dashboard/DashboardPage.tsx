import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Paper
} from '@mui/material';
import { 
  Agriculture, 
  LocationCity, 
  Assessment, 
  TrendingUp,
  Add,
  Assignment,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalRuralProperties: number;
  totalUrbanProperties: number;
  totalProperties: number;
  regularProperties: number;
  irregularProperties: number;
  pendingProperties: number;
  ruralStats: any;
  urbanStats: any;
  recentActivity: any[];
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceRate = () => {
    if (!stats || stats.totalProperties === 0) return 0;
    return Math.round((stats.regularProperties / stats.totalProperties) * 100);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!stats) return null;

  const complianceRate = calculateComplianceRate();

  return (
    <Container maxWidth="xl">
      {/* Hero Banner com Imagem Tecnológica */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box flex={1}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#0c4a6e' }}>
              Dashboard - Olá, {user?.fullName}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Sistema PGT - Gestão Inteligente de Propriedades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <img 
              src="/images/tech-dashboard.svg" 
              alt="Advanced Property Management Technology"
              style={{ 
                width: '350px', 
                height: 'auto', 
                maxHeight: '200px',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
              }}
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Agriculture color="primary" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" variant="h6">
                    Imóveis Rurais
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRuralProperties}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <LocationCity color="secondary" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" variant="h6">
                    Imóveis Urbanos
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUrbanProperties}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle color="success" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" variant="h6">
                    Regularizados
                  </Typography>
                  <Typography variant="h4">
                    {stats.regularProperties}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="info" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" variant="h6">
                    Taxa de Conformidade
                  </Typography>
                  <Typography variant="h4">
                    {complianceRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Progresso da Conformidade */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progresso de Regularização
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: '100%' }}>
              <LinearProgress 
                variant="determinate" 
                value={complianceRate} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
              {complianceRate}%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="success.main">
              {stats.regularProperties} Regulares
            </Typography>
            <Typography variant="body2" color="error.main">
              {stats.irregularProperties} Irregulares
            </Typography>
            <Typography variant="body2" color="warning.main">
              {stats.pendingProperties} Pendentes
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Ações Rápidas e Atividade Recente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  startIcon={<Add />}
                  onClick={() => navigate('/rural-properties')}
                >
                  Cadastrar Imóvel Rural
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  startIcon={<Add />}
                  onClick={() => navigate('/urban-properties')}
                >
                  Cadastrar Imóvel Urbano
                </Button>
                <Button 
                  variant="text" 
                  size="large" 
                  startIcon={<Assessment />}
                  onClick={() => navigate('/diagnostics')}
                >
                  Gerar Diagnóstico com IA
                </Button>
                <Button 
                  variant="text" 
                  size="large" 
                  startIcon={<Assignment />}
                  onClick={() => navigate('/ai')}
                >
                  Chat com Especialista IA
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Atividade Recente
              </Typography>
              <Box>
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <Box key={activity.id || index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight="bold">
                          {activity.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                        {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma atividade recente.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}