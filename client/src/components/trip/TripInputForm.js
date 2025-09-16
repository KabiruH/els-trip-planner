// src/components/trip/TripInputForm.js
import React, { useState, useEffect } from 'react';
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

// Import API services
import { tripService, apiUtils } from '../../services/api';

// Import Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default marker fix for React-Leaflet + Webpack
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});
L.Marker.prototype.options.icon = DefaultIcon;

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
    notes: '',
    planned_start_time: new Date().toISOString().slice(0, 16), // Default to now
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store coordinates for map display
  const [coords, setCoords] = useState({
    currentLocation: null,
    pickupLocation: null,
    dropoffLocation: null
  });

  const steps = [
    { 
      title: 'Current Status', 
      icon: <Person />,
      description: 'Your current location and HOS status'
    },
    { 
      title: 'Trip Details', 
      icon: <LocationOn />,
      description: 'Pickup and dropoff locations'
    },
    { 
      title: 'Review & Plan', 
      icon: <CheckCircle />,
      description: 'Confirm details and plan trip'
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
      if (!formData.currentLocation.trim()) {
        newErrors.currentLocation = 'Current location is required';
      }
      if (formData.currentCycleHours < 0 || formData.currentCycleHours > 70) {
        newErrors.currentCycleHours = 'Cycle hours must be between 0 and 70';
      }
    } else if (step === 1) {
      if (!formData.pickupLocation.trim()) {
        newErrors.pickupLocation = 'Pickup location is required';
      }
      if (!formData.dropoffLocation.trim()) {
        newErrors.dropoffLocation = 'Dropoff location is required';
      }
      if (!formData.planned_start_time) {
        newErrors.planned_start_time = 'Start time is required';
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

  const parseLocation = (locationString) => {
    const parts = locationString.split(',').map(part => part.trim());
    return {
      lat: 0,
      lng: 0,
      address: locationString
    };
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;

    setIsSubmitting(true);
    try {
      const tripData = {
        current_location: parseLocation(formData.currentLocation),
        pickup_location: parseLocation(formData.pickupLocation),
        dropoff_location: parseLocation(formData.dropoffLocation),
        current_cycle_hours: parseFloat(formData.currentCycleHours),
        planned_start_time: new Date(formData.planned_start_time).toISOString()
      };

      const result = await tripService.planTrip(tripData);
      onTripSubmit(result);
      
    } catch (err) {
      console.error('Trip planning error:', err);
      setErrors({ submit: apiUtils.formatError(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch coordinates from Nominatim API
  useEffect(() => {
    const fetchCoords = async (field, query) => {
      if (!query) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data[0]) {
          setCoords(prev => ({ ...prev, [field]: [parseFloat(data[0].lat), parseFloat(data[0].lon)] }));
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    };

    fetchCoords("currentLocation", formData.currentLocation);
    fetchCoords("pickupLocation", formData.pickupLocation);
    fetchCoords("dropoffLocation", formData.dropoffLocation);
  }, [formData.currentLocation, formData.pickupLocation, formData.dropoffLocation]);

  const LocationMap = ({ coords, label }) => {
    if (!coords) return null;
    return (
      <Box sx={{ mt: 2, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{label} Map Preview</Typography>
        <MapContainer center={coords} zoom={12} style={{ height: "250px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={coords}>
            <Popup>{label}</Popup>
          </Marker>
        </MapContainer>
      </Box>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Current Location"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              error={!!errors.currentLocation}
              helperText={errors.currentLocation || "Where are you now? (e.g., Chicago, IL)"}
              required
              margin="normal"
              placeholder="Enter your current location"
            />
            {coords.currentLocation && (
              <LocationMap coords={coords.currentLocation} label="Current Location" />
            )}

            <TextField
              fullWidth
              label="Current Cycle Hours"
              name="currentCycleHours"
              type="number"
              value={formData.currentCycleHours}
              onChange={handleInputChange}
              error={!!errors.currentCycleHours}
              helperText={errors.currentCycleHours || "Hours used in current 8-day cycle (0-70)"}
              required
              margin="normal"
              inputProps={{ min: 0, max: 70, step: 0.1 }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your cycle hours help us ensure HOS compliance. Enter the total hours you've worked in the past 8 days.
              </Typography>
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Pickup Location"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              error={!!errors.pickupLocation}
              helperText={errors.pickupLocation || "Where will you pick up the load?"}
              required
              margin="normal"
              placeholder="e.g. Milwaukee, WI"
            />
            {coords.pickupLocation && (
              <LocationMap coords={coords.pickupLocation} label="Pickup Location" />
            )}

            <TextField
              fullWidth
              label="Dropoff Location"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleInputChange}
              error={!!errors.dropoffLocation}
              helperText={errors.dropoffLocation || "Where will you deliver the load?"}
              required
              margin="normal"
              placeholder="e.g. Atlanta, GA"
            />
            {coords.dropoffLocation && (
              <LocationMap coords={coords.dropoffLocation} label="Dropoff Location" />
            )}

            <TextField
              fullWidth
              label="Planned Start Time"
              name="planned_start_time"
              type="datetime-local"
              value={formData.planned_start_time}
              onChange={handleInputChange}
              error={!!errors.planned_start_time}
              helperText={errors.planned_start_time || "When do you plan to start this trip?"}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
              placeholder="Special instructions, cargo details, or other notes"
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} /> Current Status
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Current Location:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.currentLocation}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Cycle Hours Used:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.currentCycleHours}h / 70h</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <LocationOn sx={{ mr: 1 }} /> Trip Details
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Pickup:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.pickupLocation}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Dropoff:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">{formData.dropoffLocation}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Start Time:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(formData.planned_start_time).toLocaleString()}
                  </Typography>
                </Grid>
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

            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}

            <Alert severity="info">
              <Typography variant="body2">
                Click "Plan Trip" to generate an HOS-compliant route with mandatory stops and compliance checking.
              </Typography>
            </Alert>
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
                    disabled={loading || isSubmitting}
                    startIcon={index === steps.length - 1 ? <LocalShipping /> : <ArrowForward />}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 
                      ? (isSubmitting ? 'Planning Trip...' : 'Plan Trip') 
                      : 'Next'
                    }
                  </Button>
                  {index > 0 && (
                    <Button
                      onClick={handleBack}
                      disabled={loading || isSubmitting}
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
