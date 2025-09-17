// src/pages/LoginPage.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper,
  ThemeProvider,
  createTheme,
  Grid,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ContentCopy, AccountCircle, Lock } from '@mui/icons-material';
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

const MainContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '1200px !important',
  padding: '40px',
  position: 'relative',
  zIndex: 1,
  gap: '40px',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    gap: '30px',
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '450px',
  width: '100%',
}));

const DemoCredentialsContainer = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  padding: '32px',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  maxWidth: '350px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '450px',
  },
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem',
  },
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

const CredentialBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
  },
}));

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const demoCredentials = {
    email: 'kelkab46@gmail.com',
    password: 'password'
  };

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

  const handleCopyCredential = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRegisterClick = () => {
    // You can implement navigation to register page here
    console.log('Navigate to register page');
  };

  return (
    <ThemeProvider theme={theme}>
      <FullPageContainer>
        <MainContainer>
          {/* Main Login Section */}
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

          {/* Demo Credentials Section */}
          <DemoCredentialsContainer elevation={0}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                🎯 Demo Account
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 2 
                }}
              >
                Use these credentials for testing
              </Typography>
              <Chip 
                label="Interview Demo" 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>

            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 3 }} />

            {/* Email Credential */}
            <CredentialBox>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountCircle sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600
                  }}
                >
                  Email Address
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                >
                  {demoCredentials.email}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopyCredential('email', demoCredentials.email)}
                  sx={{ 
                    color: copiedField === 'email' ? '#4ade80' : 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              {copiedField === 'email' && (
                <Typography variant="caption" sx={{ color: '#4ade80', mt: 0.5, display: 'block' }}>
                  Copied! ✓
                </Typography>
              )}
            </CredentialBox>

            {/* Password Credential */}
            <CredentialBox>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Lock sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600
                  }}
                >
                  Password
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                >
                  {demoCredentials.password}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopyCredential('password', demoCredentials.password)}
                  sx={{ 
                    color: copiedField === 'password' ? '#4ade80' : 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              {copiedField === 'password' && (
                <Typography variant="caption" sx={{ color: '#4ade80', mt: 0.5, display: 'block' }}>
                  Copied! ✓
                </Typography>
              )}
            </CredentialBox>

            <Box 
              sx={{ 
                textAlign: 'center',
                mt: 3,
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  mb: 0.5
                }}
              >
                💡 Quick Tip
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.4
                }}
              >
                Click the copy icons to quickly paste credentials into the login form
              </Typography>
            </Box>
          </DemoCredentialsContainer>
        </MainContainer>
      </FullPageContainer>
    </ThemeProvider>
  );
};

export default LoginPage;