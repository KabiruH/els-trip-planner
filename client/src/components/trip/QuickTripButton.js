import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  ArrowForward,
  LocalShipping,
  Schedule,
  Straighten,
  LocationOn,
  FlashOn
} from '@mui/icons-material';

const QuickTripButton = ({ 
  route,
  onQuickTripSelect,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onQuickTripSelect(route);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultRoute = {
    id: 'route-1',
    name: 'Chicago to Atlanta',
    from: 'Chicago, IL',
    to: 'Atlanta, GA',
    distance: '716 miles',
    estimatedTime: '11h 30m',
    frequentRoute: true,
    lastUsed: '2 days ago',
    icon: '🚛'
  };

  const routeData = route || defaultRoute;

  return (
    <Card
      sx={{
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': !disabled && !isLoading ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: 'warning.main'
        } : {},
        border: 2,
        borderColor: 'grey.200'
      }}
      onClick={handleClick}
      className={className}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
              fontSize: '1.5rem',
              boxShadow: 2
            }}
          >
            {routeData.icon || <LocalShipping />}
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" component="div" gutterBottom>
              {routeData.name}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={0.5}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {routeData.from} → {routeData.to}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box display="flex" alignItems="center">
                <Straighten fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {routeData.distance}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Schedule fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {routeData.estimatedTime}
                </Typography>
              </Box>
            </Box>
            
            {routeData.lastUsed && (
              <Chip
                label={`Last used: ${routeData.lastUsed}`}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
          
          <IconButton
            color="warning"
            sx={{
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateX(4px)'
              }
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>

        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1
            }}
          >
            <CircularProgress color="warning" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const QuickTripButtons = ({ routes = [], onQuickTripSelect, title = "Quick Routes" }) => {
  const sampleRoutes = routes.length > 0 ? routes : [
    {
      id: 'route-1',
      name: 'Chicago to Atlanta',
      from: 'Chicago, IL',
      to: 'Atlanta, GA',
      distance: '716 miles',
      estimatedTime: '11h 30m',
      lastUsed: '2 days ago',
      icon: '🚛'
    },
    {
      id: 'route-2',
      name: 'Milwaukee to Detroit',
      from: 'Milwaukee, WI',
      to: 'Detroit, MI',
      distance: '377 miles',
      estimatedTime: '6h 15m',
      lastUsed: '5 days ago',
      icon: '🚚'
    },
    {
      id: 'route-3',
      name: 'Green Bay to Minneapolis',
      from: 'Green Bay, WI',
      to: 'Minneapolis, MN',
      distance: '304 miles',
      estimatedTime: '5h 45m',
      lastUsed: '1 week ago',
      icon: '🚐'
    }
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <FlashOn color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a frequently used route to start planning instantly
        </Typography>
        
        <Grid container spacing={1.5}>
          {sampleRoutes.map((route) => (
            <Grid item xs={12} key={route.id}>
              <QuickTripButton
                route={route}
                onQuickTripSelect={onQuickTripSelect}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickTripButton;
export { QuickTripButtons };