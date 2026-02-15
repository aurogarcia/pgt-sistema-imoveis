import React from 'react';
import { Container, Typography } from '@mui/material';

export function DiagnosticsPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Diagnósticos
      </Typography>
      <Typography variant="body1">
        Sistema de diagnósticos automatizados em desenvolvimento...
      </Typography>
    </Container>
  );
}