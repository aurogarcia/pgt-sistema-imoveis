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
  Select,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationCity,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Home,
  Business,
  Factory
} from '@mui/icons-material';
import { propertyService } from '../../services/propertyService';

interface UrbanProperty {
  id: string;
  propertyName?: string;
  propertyType: string;
  landAreaM2: number;
  builtAreaM2?: number;
  state: string;
  municipality: string;
  neighborhood?: string;
  streetAddress: string;
  regularizationStatus: string;
  reurb: {
    modalityType?: string;
    hasPossession: boolean;
    hasInfrastructure: boolean;
  };
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

const propertyTypeIcons = {
  residential: <Home />,
  commercial: <Business />,
  industrial: <Factory />,
  mixed: <LocationCity />
};

const propertyTypeLabels = {
  residential: 'Residencial',
  commercial: 'Comercial',
  industrial: 'Industrial',
  mixed: 'Misto',
  vacant_lot: 'Terreno Vazio'
};

export function UrbanPropertiesPage() {
  const [properties, setProperties] = useState<UrbanProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<UrbanProperty | null>(null);
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: 'residential',
    landAreaM2: 0,
    builtAreaM2: 0,
    state: 'RJ',
    municipality: '',
    neighborhood: '',
    streetAddress: '',
    reurb: {
      modalityType: 'social',
      hasPossession: false,
      hasInfrastructure: false
    }
  });

  useEffect(() => {
    loadProperties();
  }, [page]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null); // Limpar erro anterior
      const response = await propertyService.getUrbanProperties({ 
        page, 
        limit: 10 
      });
      setProperties(response.items || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Erro ao carregar propriedades urbanas:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError(err.response?.data?.error || 'Erro ao carregar propriedades urbanas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProperty(null);
    setFormData({
      propertyName: '',
      propertyType: 'residential',
      landAreaM2: 0,
      builtAreaM2: 0,
      state: 'RJ',
      municipality: '',
      neighborhood: '',
      streetAddress: '',
      reurb: {
        modalityType: 'social',
        hasPossession: false,
        hasInfrastructure: false
      }
    });
    setOpenDialog(true);
  };

  const handleEdit = (property: UrbanProperty) => {
    setSelectedProperty(property);
    setFormData({
      propertyName: property.propertyName || '',
      propertyType: property.propertyType,
      landAreaM2: property.landAreaM2,
      builtAreaM2: property.builtAreaM2 || 0,
      state: property.state,
      municipality: property.municipality,
      neighborhood: property.neighborhood || '',
      streetAddress: property.streetAddress,
      reurb: property.reurb
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (selectedProperty) {
        await propertyService.updateUrbanProperty(selectedProperty.id, formData);
      } else {
        await propertyService.createUrbanProperty(formData);
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
        await propertyService.deleteUrbanProperty(id);
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

  const calculateREURBEligibility = (property: UrbanProperty) => {
    const { reurb } = property;
    let score = 0;
    if (reurb.hasPossession) score += 50;
    if (reurb.hasInfrastructure) score += 50;
    return score;
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
      {/* Banner Imóveis Urbanos */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <LocationCity sx={{ fontSize: 40, color: '#2563eb' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1d4ed8' }}>
                Imóveis Urbanos - REURB
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Regularização Urbanística com Smart City Technology
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Controle digital de propriedades urbanas, REURB e infraestrutura IoT
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <img 
              src="/images/urban-properties.svg" 
              alt="Smart Urban Property Management"
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
          Cadastro REURB
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ 
            background: 'linear-gradient(45deg, #3b82f6 30%, #2563eb 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2563eb 30%, #1d4ed8 90%)',
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
                <LocationCity color="primary" />
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
                <Business color="info" />
                <Box>
                  <Typography variant="h6">
                    {properties.filter(p => p.reurb.modalityType === 'social').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    REURB Social
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
                <Factory color="secondary" />
                <Box>
                  <Typography variant="h6">
                    {Math.round(properties.reduce((sum, p) => sum + p.landAreaM2, 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    m² Totais
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
                <TableCell>Área (m²)</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>REURB</TableCell>
                <TableCell>Elegibilidade</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {property.propertyName || property.streetAddress}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.streetAddress}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {propertyTypeIcons[property.propertyType as keyof typeof propertyTypeIcons]}
                      <Typography variant="body2">
                        {propertyTypeLabels[property.propertyType as keyof typeof propertyTypeLabels]}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {property.landAreaM2.toFixed(0)} m² (terreno)
                      </Typography>
                      {property.builtAreaM2 && (
                        <Typography variant="caption" color="text.secondary">
                          {property.builtAreaM2.toFixed(0)} m² (construída)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {property.municipality}/{property.state}
                      </Typography>
                      {property.neighborhood && (
                        <Typography variant="caption" color="text.secondary">
                          {property.neighborhood}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
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
                      label={property.reurb.modalityType === 'social' ? 'Social' : 'Específica'}
                      color={property.reurb.modalityType === 'social' ? 'primary' : 'secondary'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {calculateREURBEligibility(property)}%
                      </Typography>
                      <Chip
                        label={calculateREURBEligibility(property) >= 50 ? 'Elegível' : 'Parcial'}
                        color={calculateREURBEligibility(property) >= 50 ? 'success' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProperty ? 'Editar' : 'Nova'} Propriedade Urbana
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Propriedade (opcional)"
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
                  <MenuItem value="residential">Residencial</MenuItem>
                  <MenuItem value="commercial">Comercial</MenuItem>
                  <MenuItem value="industrial">Industrial</MenuItem>
                  <MenuItem value="mixed">Misto</MenuItem>
                  <MenuItem value="vacant_lot">Terreno Vazio</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Área do Terreno (m²)"
                type="number"
                value={formData.landAreaM2}
                onChange={(e) => setFormData({ ...formData, landAreaM2: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Área Construída (m²)"
                type="number"
                value={formData.builtAreaM2}
                onChange={(e) => setFormData({ ...formData, builtAreaM2: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={3}>
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
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Município"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço Completo"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                REURB - Regularização Fundiária Urbana
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Modalidade REURB</InputLabel>
                <Select
                  value={formData.reurb.modalityType}
                  label="Modalidade REURB"
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    reurb: { ...formData.reurb, modalityType: e.target.value }
                  })}
                >
                  <MenuItem value="social">REURB-S (Social)</MenuItem>
                  <MenuItem value="specific">REURB-E (Específica)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reurb.hasPossession}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      reurb: { ...formData.reurb, hasPossession: e.target.checked }
                    })}
                  />
                }
                label="Possui Vínculo de Posse"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reurb.hasInfrastructure}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      reurb: { ...formData.reurb, hasInfrastructure: e.target.checked }
                    })}
                  />
                }
                label="Possui Infraestrutura Urbana"
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