import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          Registro - Sistema PGT
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Página de registro em desenvolvimento...
        </Typography>
      </Box>
    </Container>
  );
}