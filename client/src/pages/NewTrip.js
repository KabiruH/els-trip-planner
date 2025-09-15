import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping
} from '@mui/icons-material';

// Import our Material-UI components from the components folder
import TripInputForm from '../components/trip/TripInputForm';
import { QuickTripButtons } from '../components/trip/QuickTripButton';

const NewTrip = ({ driver = { name: 'John Smith', id: '001' } }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuickRoutes, setShowQuickRoutes] = useState(true);

  const quickRoutes = [
    { id: 1, name: 'Chicago → Atlanta', from: 'Chicago, IL', to: 'Atlanta, GA', distance: '716 miles', estimatedTime: '11h 30m', icon: '🚛' },
    { id: 2, name: 'Milwaukee → Detroit', from: 'Milwaukee, WI', to: 'Detroit, MI', distance: '377 miles', estimatedTime: '6h 15m', icon: '🚚' },
    { id: 3, name: 'Green Bay → Minneapolis', from: 'Green Bay, WI', to: 'Minneapolis, MN', distance: '304 miles', estimatedTime: '5h 45m', icon: '🚐' }
  ];

  const handleTripSubmit = async (tripData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Trip submitted:', tripData);
      alert('Trip planning completed! Redirecting to results...');
    } catch (err) {
      setError('Failed to plan trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (route) => {
    console.log('Quick route selected:', route);
    setShowQuickRoutes(false);
    
    // Pre-fill the form data would happen here in real implementation
    alert(`Selected route: ${route.name}. Form will be pre-filled.`);
  };

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard');
    alert('Navigating back to dashboard...');
  };

  const initialFormData = {
    driverName: driver.name,
    vehicleNumber: 'TRK-001',
    currentCycleHours: 0,
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    notes: ''
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
   
          
          <Box flexGrow={1}>
            <Typography variant="h6" component="div">
              Plan New Trip
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Create HOS-compliant route with automated logging
            </Typography>
          </Box>

          <LocalShipping sx={{ fontSize: 32 }} />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {showQuickRoutes && (
          <Button
            variant="outlined"
            onClick={() => setShowQuickRoutes(false)}
            sx={{ 
              mb: 2,
              '&:hover': {
                borderColor: 'warning.main',
                color: 'warning.main'
              }
            }}
          >
            Skip to Manual Entry →
          </Button>
        )}

        <Grid container spacing={3}>
          {/* Main Trip Form */}
          <Grid item xs={12} lg={showQuickRoutes ? 8 : 12}>
            <TripInputForm 
              onTripSubmit={handleTripSubmit}
              initialData={initialFormData}
              loading={loading}
              error={error}
            />
          </Grid>

          {/* Quick Routes Sidebar */}
          {showQuickRoutes && (
            <Grid item xs={12} lg={4}>
              <QuickTripButtons 
                routes={quickRoutes}
                onQuickTripSelect={handleQuickSelect}
                title="Quick Routes"
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default NewTrip;