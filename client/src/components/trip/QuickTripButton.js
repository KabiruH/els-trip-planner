// src/components/trip/QuickTripButtons.js
import React, { useState, useEffect } from 'react';
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

// Import API services
import { tripService, driverService } from '../../services/api';

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
            {route.icon || <LocalShipping />}
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" component="div" gutterBottom>
              {route.name}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={0.5}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {route.from} → {route.to}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box display="flex" alignItems="center">
                <Straighten fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {route.distance}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Schedule fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {route.estimatedTime}
                </Typography>
              </Box>
            </Box>
            
            {route.lastUsed && (
              <Chip
                label={`Last used: ${route.lastUsed}`}
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

const QuickTripButtons = ({ onQuickTripSelect, title = "Quick Routes" }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTrips = async () => {
      try {
        setLoading(true);
        // Get recent trips from API and convert to route format
        const recentTrips = await driverService.getRecentTrips();
        
        const quickRoutes = recentTrips
          .filter(trip => trip.status === 'completed') // Only show completed trips
          .slice(0, 3) // Limit to 3 most recent
          .map(trip => ({
            id: trip.id,
            name: `${getLocationName(trip.pickup_location)} to ${getLocationName(trip.dropoff_location)}`,
            from: trip.pickup_location.address || 'Unknown',
            to: trip.dropoff_location.address || 'Unknown',
            distance: trip.total_distance ? `${trip.total_distance} miles` : 'N/A',
            estimatedTime: trip.estimated_duration ? formatDuration(trip.estimated_duration) : 'N/A',
            lastUsed: formatLastUsed(trip.created_at),
            icon: '🚛',
            // Store original trip data for planning
            pickup_location: trip.pickup_location,
            dropoff_location: trip.dropoff_location
          }));

        setRoutes(quickRoutes);
      } catch (error) {
        console.error('Failed to fetch recent trips:', error);
        // Fallback to sample routes
        setRoutes(getSampleRoutes());
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTrips();
  }, []);

  const getLocationName = (location) => {
    if (!location) return 'Unknown';
    return location.address?.split(',')[0] || location.address || 'Unknown';
  };

  const formatDuration = (duration) => {
    // Convert duration string (e.g., "11:30:00") to readable format
    if (typeof duration === 'string' && duration.includes(':')) {
      const [hours, minutes] = duration.split(':');
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  const formatLastUsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getSampleRoutes = () => [
    {
      id: 'sample-1',
      name: 'Chicago to Atlanta',
      from: 'Chicago, IL',
      to: 'Atlanta, GA',
      distance: '716 miles',
      estimatedTime: '11h 30m',
      lastUsed: 'No recent trips',
      icon: '🚛'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FlashOn color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

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
          {routes.map((route) => (
            <Grid item xs={12} key={route.id}>
              <QuickTripButton
                route={route}
                onQuickTripSelect={onQuickTripSelect}
              />
            </Grid>
          ))}
        </Grid>

        {routes.length === 0 && (
          <Box textAlign="center" py={3}>
            <LocalShipping sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Complete some trips to see quick routes here
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickTripButton;
export { QuickTripButtons };
