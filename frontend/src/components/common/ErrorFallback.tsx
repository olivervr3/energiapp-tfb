import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <BugIcon 
            sx={{ 
              fontSize: 64, 
              color: 'error.main',
              mb: 2,
            }} 
          />
          <Typography variant="h4" color="error" gutterBottom>
            ¡Oops! Algo salió mal
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Ha ocurrido un error inesperado en la aplicación. 
            Nuestro equipo ha sido notificado y trabajamos para solucionarlo.
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Error:</strong> {error.message}
          </Typography>
        </Alert>

        {isDevelopment && (
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {error.stack}
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetErrorBoundary}
            size="large"
          >
            Intentar de nuevo
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => window.location.href = '/'}
            size="large"
          >
            Ir al inicio
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          Si el problema persiste, contacta con el soporte técnico.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ErrorFallback;
