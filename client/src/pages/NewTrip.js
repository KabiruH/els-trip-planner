import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography, 
  Button,
  Container,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  Schedule,
  Warning,
  CheckCircle,
  Route
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import API services
import { tripService, driverService, authService, apiUtils } from '../services/api';

// Import your existing components (they already have API integration)
import TripInputForm from '../components/trip/TripInputForm';
import { QuickTripButtons } from '../components/trip/QuickTripButton';


const NewTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuickRoutes, setShowQuickRoutes] = useState(true);
  const [driverData, setDriverData] = useState(null);
  const [hosData, setHosData] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setInitializing(true);
      
      // Fetch driver info, HOS status, and recent trips in parallel
      const [driver, hosStatus, trips] = await Promise.all([
        driverService.getProfile(),
        driverService.getHOSStatus(),
        driverService.getRecentTrips().catch(() => []) // Don't fail if no recent trips
      ]);

      setDriverData(driver);
      setHosData(hosStatus);
      setRecentTrips(trips);

    } catch (err) {
      console.error('Error initializing page:', err);
      setError('Failed to load driver information');
    } finally {
      setInitializing(false);
    }
  };

  const handleTripSubmit = async (tripData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Since your TripInputForm already handles the API call and returns the result,
      // we just need to handle the response here
      console.log('Trip planning result:', tripData);
      
      // Navigate to trip results page with the planned trip data
      // Replace with your actual navigation method
      if (typeof navigate === 'function') {
        navigate('/trip-results', { 
          state: { 
            tripPlan: tripData
          } 
        });
      } else {
        alert('Trip planning completed! Redirecting to results...');
        console.log('Trip result:', tripData);
      }

    } catch (err) {
      console.error('Trip planning error:', err);
      setError(apiUtils.formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (route) => {
    console.log('Quick route selected:', route);
    
    // Your QuickTripButtons component already handles the route selection,
    // this is just to provide feedback and hide the sidebar if needed
    setShowQuickRoutes(false);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Generate quick routes based on recent trips
  const generateQuickRoutes = () => {
    const quickRoutes = [];
    
    // Add recent trips as quick routes
    recentTrips.slice(0, 3).forEach((trip, index) => {
      if (trip.pickup_location && trip.dropoff_location) {
        // Handle pickup_location - it's a JSON object with address property
        const pickupAddress = typeof trip.pickup_location === 'string' 
          ? trip.pickup_location 
          : trip.pickup_location.address || 'Unknown';
        
        const dropoffAddress = typeof trip.dropoff_location === 'string'
          ? trip.dropoff_location
          : trip.dropoff_location.address || 'Unknown';
        
        // Get city names for the route display
        const pickupCity = pickupAddress.split(',')[0] || pickupAddress;
        const dropoffCity = dropoffAddress.split(',')[0] || dropoffAddress;
        
        quickRoutes.push({
          id: `recent-${trip.id}`,
          name: `${pickupCity} → ${dropoffCity}`,
          from: pickupAddress,
          to: dropoffAddress,
          distance: trip.total_distance ? `${trip.total_distance} miles` : 'Distance TBD',
          estimatedTime: trip.estimated_duration || 'Time TBD',
          icon: '🔄',
          isRecent: true
        });
      }
    });

    // Add some default popular routes if we don't have enough recent trips
    const defaultRoutes = [
      { 
        id: 'default-1', 
        name: 'Chicago → Atlanta', 
        from: 'Chicago, IL', 
        to: 'Atlanta, GA', 
        distance: '716 miles', 
        estimatedTime: '11h 30m', 
        icon: '🚛' 
      },
      { 
        id: 'default-2', 
        name: 'Milwaukee → Detroit', 
        from: 'Milwaukee, WI', 
        to: 'Detroit, MI', 
        distance: '377 miles', 
        estimatedTime: '6h 15m', 
        icon: '🚚' 
      },
      { 
        id: 'default-3', 
        name: 'Green Bay → Minneapolis', 
        from: 'Green Bay, WI', 
        to: 'Minneapolis, MN', 
        distance: '304 miles', 
        estimatedTime: '5h 45m', 
        icon: '🚐' 
      }
    ];

    // Fill remaining slots with default routes
    while (quickRoutes.length < 3) {
      const defaultRoute = defaultRoutes[quickRoutes.length];
      if (defaultRoute) {
        quickRoutes.push(defaultRoute);
      } else {
        break;
      }
    }

    return quickRoutes;
  };

  const quickRoutes = generateQuickRoutes();

  const getInitialFormData = () => {
    if (!driverData) return {};
    
    return {
      driverName: `${driverData.first_name || ''} ${driverData.last_name || ''}`.trim(),
      vehicleNumber: driverData.vehicle_number || '',
      currentCycleHours: hosData?.cycle_hours_used || 0,
      currentLocation: driverData.current_location || '',
      pickupLocation: '',
      dropoffLocation: '',
      pickupTime: '',
      notes: ''
    };
  };

  const getHOSStatusChip = () => {
    if (!hosData) return null;
    
    if (!hosData.can_drive) {
      return (
        <Chip 
          icon={<Warning />}
          label="Cannot Drive"
          color="error"
          size="small"
        />
      );
    }
    
    if (hosData.current_cycle_hours >= 60) {
      return (
        <Chip 
          icon={<Schedule />}
          label="High Cycle Hours"
          color="warning"
          size="small"
        />
      );
    }
    
    return (
      <Chip 
        icon={<CheckCircle />}
        label="HOS Compliant"
        color="success"
        size="small"
      />
    );
  };

  if (initializing) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 0
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <LocalShipping sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Plan New Trip
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Create HOS-compliant route with automated logging
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Container>
        </Paper>
        
        <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading trip planning interface...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
      pt: 3,
      pb: 4
    }}>
      {/* Simple Header */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          
          <Stack direction="row" spacing={1}>
            {getHOSStatusChip()}
            {hosData && (
              <Chip 
                label={`${parseFloat(hosData.current_cycle_hours || 0).toFixed(1)}h / 70h`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Plan New Trip
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create HOS-compliant route with automated logging
        </Typography>
      </Container>
      {/* Main Content */}
      <Container maxWidth="lg">
        {/* HOS Alerts */}
        {hosData && !hosData.can_drive && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'error.200'
            }}
          >
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Cannot Drive - HOS Violation
            </Typography>
            <Typography variant="body2">
              You are currently not allowed to drive due to Hours of Service regulations. 
              Please take required rest before planning a new trip.
            </Typography>
          </Alert>
        )}

        {hosData && hosData.current_cycle_hours >= 60 && hosData.can_drive && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'warning.200'
            }}
          >
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              High Cycle Hours ({parseFloat(hosData.current_cycle_hours).toFixed(1)}/70 hours used)
            </Typography>
            <Typography variant="body2">
              You are approaching your 70-hour limit. Plan accordingly for required rest periods.
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Quick Route Toggle */}
        {showQuickRoutes && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowQuickRoutes(false)}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  bgcolor: 'warning.50'
                }
              }}
            >
              Skip to Manual Entry →
            </Button>
          </Box>
        )}

        {/* Main Grid */}
        <Grid container spacing={4}>
          {/* Trip Form */}
          <Grid item xs={12} lg={showQuickRoutes ? 8 : 12}>
            <Paper 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                overflow: 'hidden'
              }}
            >
              <TripInputForm 
                onTripSubmit={handleTripSubmit}
                initialData={getInitialFormData()}
                loading={loading}
                error={error}
                hosData={hosData}
                canDrive={hosData?.can_drive ?? true}
              />
            </Paper>
          </Grid>

          {/* Quick Routes Sidebar */}
          {showQuickRoutes && (
            <Grid item xs={12} lg={4}>
              <Paper 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'grey.100',
                  overflow: 'hidden'
                }}
              >
                <QuickTripButtons 
                  routes={quickRoutes}
                  onQuickTripSelect={handleQuickSelect}
                  title={recentTrips.length > 0 ? "Recent & Quick Routes" : "Quick Routes"}
                  canDrive={hosData?.can_drive ?? true}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default NewTrip;