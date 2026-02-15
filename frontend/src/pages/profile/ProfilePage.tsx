import React from 'react';
import { Container, Typography } from '@mui/material';

export function ProfilePage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>
      <Typography variant="body1">
        Gestão de perfil de usuário em desenvolvimento...
      </Typography>
    </Container>
  );
}