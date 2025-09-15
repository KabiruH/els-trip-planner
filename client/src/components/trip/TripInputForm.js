import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Grid,
  Alert,
  Avatar
} from '@mui/material';
import {
  Person,
  LocationOn,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  LocalShipping
} from '@mui/icons-material';

const TripInputForm = ({ 
  onTripSubmit,
  initialData = {},
  loading = false,
  error = null
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    currentCycleHours: 0,
    driverName: '',
    vehicleNumber: '',
    pickupTime: '',
    notes: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { 
      title: 'Driver Info', 
      icon: <Person />,
      description: 'Basic driver information'
    },
    { 
      title: 'Trip Details', 
      icon: <LocationOn />,
      description: 'Trip locations and timing'
    },
    { 
      title: 'Review', 
      icon: <CheckCircle />,
      description: 'Confirm trip details'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.driverName.trim()) {
        newErrors.driverName = 'Driver name is required';
      }
      if (!formData.vehicleNumber.trim()) {
        newErrors.vehicleNumber = 'Vehicle number is required';
      }
      if (formData.currentCycleHours < 0 || formData.currentCycleHours > 70) {
        newErrors.currentCycleHours = 'Cycle hours must be between 0 and 70';
      }
    } else if (step === 1) {
      if (!formData.currentLocation.trim()) {
        newErrors.currentLocation = 'Current location is required';
      }
      if (!formData.pickupLocation.trim()) {
        newErrors.pickupLocation = 'Pickup location is required';
      }
      if (!formData.dropoffLocation.trim()) {
        newErrors.dropoffLocation = 'Dropoff location is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(1)) {
      onTripSubmit(formData);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Driver Name"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              error={!!errors.driverName}
              helperText={errors.driverName}
              required
              margin="normal"
              placeholder="Enter driver name"
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  error={!!errors.vehicleNumber}
                  helperText={errors.vehicleNumber}
                  required
                  margin="normal"
                  placeholder="e.g. TRK-001"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Cycle Hours"
                  name="currentCycleHours"
                  type="number"
                  value={formData.currentCycleHours}
                  onChange={handleInputChange}
                  error={!!errors.currentCycleHours}
                  helperText={errors.currentCycleHours || "0-70 hours"}
                  required
                  margin="normal"
                  inputProps={{ min: 0, max: 70 }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Current Location"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              error={!!errors.currentLocation}
              helperText={errors.currentLocation}
              required
              margin="normal"
              placeholder="e.g. Chicago, IL"
            />
            
            <TextField
              fullWidth
              label="Pickup Location"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              error={!!errors.pickupLocation}
              helperText={errors.pickupLocation}
              required
              margin="normal"
              placeholder="e.g. Milwaukee, WI"
            />
            
            <TextField
              fullWidth
              label="Dropoff Location"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleInputChange}
              error={!!errors.dropoffLocation}
              helperText={errors.dropoffLocation}
              required
              margin="normal"
              placeholder="e.g. Atlanta, GA"
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pickup Time (Optional)"
                  name="pickupTime"
                  type="datetime-local"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Special instructions or notes"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} /> Trip Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Driver:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.driverName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Vehicle:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.vehicleNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Current Cycle Hours:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.currentCycleHours}h</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <LocationOn sx={{ mr: 1 }} /> Route Information
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Current Location:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.currentLocation}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Pickup Location:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.pickupLocation}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Dropoff Location:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.dropoffLocation}</Typography>
                </Grid>
                {formData.pickupTime && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Pickup Time:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">
                        {new Date(formData.pickupTime).toLocaleString()}
                      </Typography>
                    </Grid>
                  </>
                )}
                {formData.notes && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Notes:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">{formData.notes}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent sx={{ p: 3 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Plan New Trip
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter trip details for HOS-compliant route planning
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={currentStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Avatar
                    sx={{
                      bgcolor: completed ? 'success.main' : active ? 'warning.main' : 'grey.300',
                      width: 32,
                      height: 32
                    }}
                  >
                    {completed ? <CheckCircle /> : step.icon}
                  </Avatar>
                )}
              >
                <Typography variant="h6">{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={loading}
                    startIcon={index === steps.length - 1 ? <LocalShipping /> : <ArrowForward />}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 
                      ? (loading ? 'Planning Trip...' : 'Plan Trip') 
                      : 'Next'
                    }
                  </Button>
                  {index > 0 && (
                    <Button
                      onClick={handleBack}
                      disabled={loading}
                      startIcon={<ArrowBack />}
                    >
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default TripInputForm;