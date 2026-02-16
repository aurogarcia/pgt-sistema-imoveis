import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Chip,
  Alert
} from '@mui/material';
import {
  Assignment,
  Download,
  Calculate,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';

export function IRTRPage() {
  return (
    <Container maxWidth="xl">
      {/* Banner IRTR */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Assignment sx={{ fontSize: 40, color: '#d97706' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#92400e' }}>
                Relatórios IRTR
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Imposto sobre a Propriedade Territorial Rural - Gestão Digital
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cálculos automáticos, relatórios e controle de pagamentos do IRTR
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <img 
              src="/images/irtr-reports.svg" 
              alt="Digital IRTR Reports System"
              style={{ 
                width: '240px', 
                height: 'auto', 
                maxHeight: '150px',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
              }}
            />
          </Box>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Módulo em Desenvolvimento:</strong> Sistema completo de cálculo e gestão do IRTR será implementado em breve. 
          Inclui integração com dados do INCRA, cálculo automático do VTN e geração de relatórios digitais.
        </Typography>
      </Alert>

      {/* Cards de Funcionalidades Futuras */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Calculate color="primary" />
                <Typography variant="h6">
                  Cálculo Automático
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cálculo do IRTR baseado no VTN, área produtiva e grau de utilização
              </Typography>
              <Chip label="Em Desenvolvimento" size="small" color="warning" variant="outlined" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Download color="primary" />
                <Typography variant="h6">
                  Relatórios Digitais
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Geração automática de relatórios IRTR com assinatura digital
              </Typography>
              <Chip label="Em Desenvolvimento" size="small" color="warning" variant="outlined" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <TrendingUp color="primary" />
                <Typography variant="h6">
                  Análise Histórica
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Acompanhamento de evolução dos valores e pagamentos ao longo dos anos
              </Typography>
              <Chip label="Em Desenvolvimento" size="small" color="warning" variant="outlined" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Card de Preview das Funcionalidades */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Funcionalidades Planejadas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Integração com dados do INCRA</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Cálculo automático do VTN</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Relatórios por propriedade</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Controle de pagamentos</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Alertas de vencimento</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Exportação para PDF</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}