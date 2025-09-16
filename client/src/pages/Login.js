// src/pages/LoginPage.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LoginForm from '../components/auth/LoginForm';
import { authService, apiUtils } from '../services/api';

// Create custom theme with blue color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af',
      light: '#3b82f6',
      dark: '#1e3a8a',
    },
    background: {
      default: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
  },
});

// Styled components
const FullPageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '450px !important',
  padding: '60px 40px',
  position: 'relative',
  zIndex: 1,
}));

const TruckIcon = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: '24px',
  display: 'block',
  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
  textAlign: 'center',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: '12px',
  color: 'white',
  letterSpacing: '-0.025em',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  textAlign: 'center',
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: 400,
  lineHeight: 1.5,
  textAlign: 'center',
  marginBottom: '50px',
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  marginBottom: '40px',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: '32px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  border: '2px solid rgba(255, 255, 255, 0.6)',
  color: 'white',
  padding: '14px 28px',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.025em',
  backdropFilter: 'blur(10px)',
  marginBottom: '40px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const FooterText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  margin: '0 0 6px 0',
  fontWeight: 500,
}));

const CopyrightText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  margin: 0,
  opacity: 0.7,
}));

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the actual Django API
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Success - call parent's onLogin function with user data
      onLogin({
        token: response.token,
        driver: response.driver,
        isAuthenticated: true
      });
      
    } catch (err) {
      // Format and display API errors
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    // You can implement navigation to register page here
    console.log('Navigate to register page');
  };

  return (
    <ThemeProvider theme={theme}>
      <FullPageContainer>
        <ContentContainer>
          <TruckIcon component="div">🚛</TruckIcon>
          <Title variant="h1">ELD Trip Planner</Title>
          <Subtitle>
            Smart route planning with HOS compliance
          </Subtitle>
          
          <FormPaper elevation={0}>
            <LoginForm
              onLogin={handleLogin}
              loading={loading}
              error={error}
            />
          </FormPaper>
          
          <RegisterButton
            variant="outlined"
            onClick={handleRegisterClick}
            fullWidth={false}
          >
            New Driver? Register Here
          </RegisterButton>
          
          <Box>
            <FooterText>
              Professional Electronic Logging Device Solution
            </FooterText>
            <CopyrightText>
              © 2025 ELD Trip Planner
            </CopyrightText>
          </Box>
        </ContentContainer>
      </FullPageContainer>
    </ThemeProvider>
  );
};

export default LoginPage;