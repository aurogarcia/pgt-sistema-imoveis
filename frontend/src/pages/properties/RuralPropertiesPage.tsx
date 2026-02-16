import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Agriculture,
  LocationOn,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { propertyService } from '../../services/propertyService';

interface RuralProperty {
  id: string;
  propertyName: string;
  propertyType: string;
  totalAreaHectares: number;
  state: string;
  municipality: string;
  regularizationStatus: string;
  hasEnvironmentalLicense: boolean;
  carCode?: string;
  createdAt: string;
}

const statusColors = {
  regular: 'success',
  irregular: 'error',
  pending: 'warning',
  in_process: 'info',
  blocked: 'default'
} as const;

const statusLabels = {
  regular: 'Regular',
  irregular: 'Irregular',
  pending: 'Pendente',
  in_process: 'Em Processo',
  blocked: 'Bloqueado'
} as const;

export function RuralPropertiesPage() {
  const [properties, setProperties] = useState<RuralProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<RuralProperty | null>(null);
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: 'farm',
    totalAreaHectares: 0,
    state: 'RJ',
    municipality: '',
    hasEnvironmentalLicense: false
  });

  useEffect(() => {
    loadProperties();
  }, [page]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null); // Limpar erro anterior
      const response = await propertyService.getRuralProperties({ 
        page, 
        limit: 10 
      });
      setProperties(response.items || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Erro ao carregar propriedades rurais:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError(err.response?.data?.error || 'Erro ao carregar propriedades rurais');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProperty(null);
    setFormData({
      propertyName: '',
      propertyType: 'farm',
      totalAreaHectares: 0,
      state: 'RJ',
      municipality: '',
      hasEnvironmentalLicense: false
    });
    setOpenDialog(true);
  };

  const handleEdit = (property: RuralProperty) => {
    setSelectedProperty(property);
    setFormData({
      propertyName: property.propertyName,
      propertyType: property.propertyType,
      totalAreaHectares: property.totalAreaHectares,
      state: property.state,
      municipality: property.municipality,
      hasEnvironmentalLicense: property.hasEnvironmentalLicense
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (selectedProperty) {
        await propertyService.updateRuralProperty(selectedProperty.id, formData);
      } else {
        await propertyService.createRuralProperty(formData);
      }
      setOpenDialog(false);
      loadProperties();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar propriedade');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta propriedade?')) {
      try {
        await propertyService.deleteRuralProperty(id);
        loadProperties();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao excluir propriedade');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'regular': return <CheckCircle color="success" />;
      case 'irregular': return <ErrorIcon color="error" />;
      case 'pending': return <Warning color="warning" />;
      default: return <Warning />;
    }
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

  return (
    <Container maxWidth="xl">
      {/* Banner Imóveis Rurais */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Agriculture sx={{ fontSize: 40, color: '#16a34a' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#15803d' }}>
                Imóveis Rurais
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Gestão Inteligente de Propriedades Rurais com Tecnologia GPS e IA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Controle completo de áreas, documentação e regularização
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <img 
              src="/images/rural-properties.svg" 
              alt="Smart Rural Property Management"
              style={{ 
                width: '280px', 
                height: 'auto', 
                maxHeight: '180px',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
              }}
            />
          </Box>
        </Box>
      </Paper>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" color="text.secondary">
          Cadastro e Controle
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ 
            background: 'linear-gradient(45deg, #22c55e 30%, #16a34a 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #16a34a 30%, #15803d 90%)',
            }
          }}
        >
          Cadastrar Propriedade
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estatísticas Rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Agriculture color="primary" />
                <Box>
                  <Typography variant="h6">
                    {properties.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Propriedades
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
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="h6">
                    {properties.filter(p => p.regularizationStatus === 'regular').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regulares
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
                <Warning color="warning" />
                <Box>
                  <Typography variant="h6">
                    {properties.filter(p => p.regularizationStatus === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes
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
                <LocationOn color="info" />
                <Box>
                  <Typography variant="h6">
                    {properties.reduce((sum, p) => sum + p.totalAreaHectares, 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hectares Totais
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Propriedades */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Propriedade</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Área (ha)</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Licença Ambiental</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.propertyName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={property.propertyType === 'farm' ? 'Fazenda' : 
                            property.propertyType === 'sitio' ? 'Sítio' : 
                            property.propertyType}
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{property.totalAreaHectares.toFixed(2)}</TableCell>
                  <TableCell>{property.municipality}/{property.state}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(property.regularizationStatus)}
                      label={statusLabels[property.regularizationStatus as keyof typeof statusLabels]}
                      color={statusColors[property.regularizationStatus as keyof typeof statusColors]}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.hasEnvironmentalLicense ? 'Sim' : 'Não'}
                      color={property.hasEnvironmentalLicense ? 'success' : 'error'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(property)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(property.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box display="flex" justifyContent="center" sx={{ p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Dialog para Criar/Editar */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProperty ? 'Editar' : 'Nova'} Propriedade Rural
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Propriedade"
                value={formData.propertyName}
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.propertyType}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                >
                  <MenuItem value="farm">Fazenda</MenuItem>
                  <MenuItem value="sitio">Sítio</MenuItem>
                  <MenuItem value="settlement">Assentamento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Área (hectares)"
                type="number"
                value={formData.totalAreaHectares}
                onChange={(e) => setFormData({ ...formData, totalAreaHectares: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.state}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                >
                  <MenuItem value="RJ">Rio de Janeiro</MenuItem>
                  <MenuItem value="ES">Espírito Santo</MenuItem>
                  <MenuItem value="SP">São Paulo</MenuItem>
                  <MenuItem value="MG">Minas Gerais</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Município"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}