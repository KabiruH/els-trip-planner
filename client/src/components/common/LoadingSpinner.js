import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';

const LoadingSpinner = ({ 
  loading = false, 
  message = 'Loading...', 
  backdrop = false,
  size = 40 
}) => {
  const LoadingContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{ color: 'warning.main' }}
        />
        <LocalShipping
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * 0.6,
            color: 'warning.main'
          }}
        />
      </Box>
      
      {message && (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (!loading) return null;

  if (backdrop) {
    return (
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.8)'
        }}
        open={loading}
      >
        <LoadingContent />
      </Backdrop>
    );
  }

  return <LoadingContent />;
};

// Inline spinner for smaller loading states
export const InlineSpinner = ({ size = 20 }) => (
  <CircularProgress 
    size={size} 
    thickness={4}
    sx={{ color: 'warning.main' }}
  />
);

// Page-level loading overlay
export const PageLoader = ({ message = 'Loading page...' }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999
    }}
  >
    <LoadingSpinner loading={true} message={message} size={60} />
  </Box>
);

export default LoadingSpinner;