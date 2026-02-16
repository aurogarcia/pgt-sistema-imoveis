import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullHeight?: boolean;
}

export function LoadingSpinner({ 
  size = 40, 
  message = 'Carregando...', 
  fullHeight = false 
}: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      minHeight={fullHeight ? '100vh' : 200}
    >
      <CircularProgress size={size} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}