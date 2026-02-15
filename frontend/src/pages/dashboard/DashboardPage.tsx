import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button
} from '@mui/material';
import { 
  Agriculture, 
  LocationCity, 
  Assessment, 
  TrendingUp 
} from '@mui/icons-material';

export function DashboardPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Dashboard - Gestão de Imóveis
      </Typography>
      
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
                    245
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
                    128
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
                <Assessment color="success" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" variant="h6">
                    Diagnósticos
                  </Typography>
                  <Typography variant="h4">
                    89
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
                    Conformidade
                  </Typography>
                  <Typography variant="h4">
                    76%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="contained" size="large">
                  Cadastrar Imóvel Rural
                </Button>
                <Button variant="outlined" size="large">
                  Cadastrar Imóvel Urbano
                </Button>
                <Button variant="text" size="large">
                  Gerar Diagnóstico com IA
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comparação RJ vs ES
              </Typography>
              <Typography variant="body1">
                Gráfico comparativo em desenvolvimento...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}