import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Agriculture,
  LocationCity,
  Visibility,
  GetApp,
  Assignment
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DiagnosticResult {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyType: 'rural' | 'urban';
  status: 'pending' | 'completed' | 'error';
  score: number;
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    suggestion: string;
  }>;
  completedAt?: string;
  recommendations: string[];
}

interface Property {
  id: string;
  name: string;
  type: 'rural' | 'urban';
}

const severityColors = {
  low: 'info',
  medium: 'warning',
  high: 'error',
  critical: 'error'
} as const;

const severityIcons = {
  low: <Info fontSize="small" />,
  medium: <Warning fontSize="small" />,
  high: <Error fontSize="small" />,
  critical: <Error fontSize="small" />
};

export function DiagnosticsPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDiagnostic, setCurrentDiagnostic] = useState<DiagnosticResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProperties();
    loadDiagnostics();
  }, []);

  const loadProperties = async () => {
    try {
      const [ruralResponse, urbanResponse] = await Promise.all([
        api.get('/rural-properties'),
        api.get('/urban-properties')
      ]);

      const ruralProps = ruralResponse.data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'rural' as const
      }));

      const urbanProps = urbanResponse.data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'urban' as const
      }));

      setProperties([...ruralProps, ...urbanProps]);
    } catch (err) {
      console.error('Erro ao carregar propriedades:', err);
    }
  };

  const loadDiagnostics = async () => {
    try {
      const response = await api.get('/diagnostics');
      setDiagnostics(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar diagnósticos:', err);
    }
  };

  const runDiagnostic = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const selectedProp = properties.find(p => p.id === selectedProperty);
      
      const response = await api.post('/diagnostics/run', {
        propertyId: selectedProperty,
        propertyType: selectedProp?.type
      });

      setCurrentDiagnostic(response.data.result);
      await loadDiagnostics();
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao executar diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Regular';
    return 'Crítico';
  };

  const getSeverityCount = (issues: DiagnosticResult['issues'], severity: string) => {
    return issues.filter(issue => issue.severity === severity).length;
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Diagnósticos Automatizados 🔍
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Análise automatizada de conformidade e regularização de propriedades
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Formulário para novo diagnóstico */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Search color="primary" />
            Executar Novo Diagnóstico
          </Typography>

          <Box display="flex" gap={2} alignItems="center">
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel>Selecione uma propriedade</InputLabel>
              <Select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                label="Selecione uma propriedade"
              >
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {property.type === 'rural' ? (
                        <Agriculture fontSize="small" color="primary" />
                      ) : (
                        <LocationCity fontSize="small" color="secondary" />
                      )}
                      {property.name}
                      <Chip size="small" label={property.type} variant="outlined" />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={runDiagnostic}
              disabled={!selectedProperty || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
              sx={{ minWidth: 150 }}
            >
              {loading ? 'Analisando...' : 'Executar'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Resultado do último diagnóstico */}
      {currentDiagnostic && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultado do Diagnóstico
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color={getScoreColor(currentDiagnostic.score)}>
                    {currentDiagnostic.score}%
                  </Typography>
                  <Typography variant="h6" color={getScoreColor(currentDiagnostic.score)}>
                    {getScoreText(currentDiagnostic.score)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Índice de Conformidade
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>
                  Resumo dos Problemas Encontrados
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                  {getSeverityCount(currentDiagnostic.issues, 'critical') > 0 && (
                    <Chip
                      icon={severityIcons.critical}
                      label={`${getSeverityCount(currentDiagnostic.issues, 'critical')} Críticos`}
                      color="error"
                    />
                  )}
                  {getSeverityCount(currentDiagnostic.issues, 'high') > 0 && (
                    <Chip
                      icon={severityIcons.high}
                      label={`${getSeverityCount(currentDiagnostic.issues, 'high')} Altos`}
                      color="error"
                      variant="outlined"
                    />
                  )}
                  {getSeverityCount(currentDiagnostic.issues, 'medium') > 0 && (
                    <Chip
                      icon={severityIcons.medium}
                      label={`${getSeverityCount(currentDiagnostic.issues, 'medium')} Médios`}
                      color="warning"
                    />
                  )}
                  {getSeverityCount(currentDiagnostic.issues, 'low') > 0 && (
                    <Chip
                      icon={severityIcons.low}
                      label={`${getSeverityCount(currentDiagnostic.issues, 'low')} Baixos`}
                      color="info"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Problemas detalhados */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Problemas Detalhados
              </Typography>
              
              {currentDiagnostic.issues.map((issue, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      {severityIcons[issue.severity]}
                      <Typography sx={{ flex: 1 }}>
                        <strong>{issue.category}:</strong> {issue.description}
                      </Typography>
                      <Chip
                        size="small"
                        label={issue.severity}
                        color={severityColors[issue.severity]}
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      <strong>Recomendação:</strong> {issue.suggestion}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* Recomendações gerais */}
            {currentDiagnostic.recommendations.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recomendações Gerais
                </Typography>
                <List>
                  {currentDiagnostic.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de diagnósticos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            Histórico de Diagnósticos
          </Typography>

          {diagnostics.length === 0 ? (
            <Alert severity="info">
              Nenhum diagnóstico executado ainda. Execute seu primeiro diagnóstico acima.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {diagnostics.map((diagnostic) => (
                <Grid item xs={12} md={6} lg={4} key={diagnostic.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" noWrap>
                            {diagnostic.propertyName}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            {diagnostic.propertyType === 'rural' ? (
                              <Agriculture fontSize="small" color="primary" />
                            ) : (
                              <LocationCity fontSize="small" color="secondary" />
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {diagnostic.propertyType}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Chip
                          label={`${diagnostic.score}%`}
                          color={getScoreColor(diagnostic.score)}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {diagnostic.completedAt 
                          ? `Executado em ${new Date(diagnostic.completedAt).toLocaleString('pt-BR')}`
                          : 'Em andamento...'
                        }
                      </Typography>

                      <Box display="flex" justify="space-between" alignItems="center">
                        <Typography variant="body2">
                          {diagnostic.issues.length} problemas encontrados
                        </Typography>
                        
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => setCurrentDiagnostic(diagnostic)}
                        >
                          Ver Detalhes
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}