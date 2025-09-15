import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    warning: {
      main: '#FF6B35',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const Layout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
          {children}
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default Layout;