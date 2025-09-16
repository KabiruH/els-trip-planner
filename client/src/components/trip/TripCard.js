// src/components/trip/TripCard.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Paper,
  Collapse,
  CircularProgress,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Schedule,
  CalendarToday,
  Cancel,
  ExpandMore,
  ExpandLess,
  Visibility,
  Delete,
  Person,
  Security,
  Straighten,
  Assignment,
  Warning,
  Error,
  Close,
  PlayArrow,
  Stop,
  LocationOn,
  Route
} from '@mui/icons-material';

// Import API services
import { tripService, eldLogsService, apiUtils } from '../../services/api';

const TripCard = ({ 
  trip,
  onViewDetails,
  onDeleteTrip,
  onTripStatusChange,
  showActions = true,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setIsDeleting(true);
      try {
        await tripService.deleteTrip(trip.id);
        if (onDeleteTrip) {
          onDeleteTrip(trip.id);
        }
      } catch (error) {
        console.error('Failed to delete trip:', error);
        alert('Failed to delete trip: ' + apiUtils.formatError(error));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBeginJourney = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      // Update trip status to active
      await tripService.updateTrip(trip.id, { status: 'active' });

      // Add initial duty status change
      await eldLogsService.addDutyChange({
        duty_status: 'on_duty_not_driving',
        timestamp: new Date().toISOString(),
        location: trip.current_location?.address || 'Trip Start Location',
        notes: `Started trip: ${formatLocation(trip.pickup_location)} to ${formatLocation(trip.dropoff_location)}`
      });

      // Notify parent component
      if (onTripStatusChange) {
        onTripStatusChange(trip.id, 'active');
      }

      setModalOpen(false);
      alert('Journey started successfully! ELD logging has begun.');

    } catch (error) {
      console.error('Failed to begin journey:', error);
      setActionError(apiUtils.formatError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteJourney = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      // Update trip status to completed
      await tripService.updateTrip(trip.id, { 
        status: 'completed',
        actual_end_time: new Date().toISOString()
      });

      // Add final duty status change
      await eldLogsService.addDutyChange({
        duty_status: 'off_duty',
        timestamp: new Date().toISOString(),
        location: trip.dropoff_location?.address || 'Trip End Location',
        notes: `Completed trip: ${formatLocation(trip.pickup_location)} to ${formatLocation(trip.dropoff_location)}`
      });

      // Notify parent component
      if (onTripStatusChange) {
        onTripStatusChange(trip.id, 'completed');
      }

      setModalOpen(false);
      alert('Journey completed successfully!');

    } catch (error) {
      console.error('Failed to complete journey:', error);
      setActionError(apiUtils.formatError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelJourney = async () => {
    if (window.confirm('Are you sure you want to cancel this journey? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        setActionError(null);

        // Update trip status to cancelled
        await tripService.updateTrip(trip.id, { status: 'cancelled' });

        // If trip was active, add duty status change to off_duty
        if (trip.status === 'active') {
          await eldLogsService.addDutyChange({
            duty_status: 'off_duty',
            timestamp: new Date().toISOString(),
            location: 'Current Location',
            notes: `Cancelled trip: ${formatLocation(trip.pickup_location)} to ${formatLocation(trip.dropoff_location)}`
          });
        }

        // Notify parent component
        if (onTripStatusChange) {
          onTripStatusChange(trip.id, 'cancelled');
        }

        setModalOpen(false);
        alert('Journey cancelled successfully.');

      } catch (error) {
        console.error('Failed to cancel journey:', error);
        setActionError(apiUtils.formatError(error));
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'planned': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle />;
      case 'active': return <LocalShipping />;
      case 'planned': return <CalendarToday />;
      case 'cancelled': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const getComplianceStatus = () => {
    if (!trip.is_hos_compliant) {
      return {
        color: 'error',
        icon: <Error />,
        text: 'HOS Violation',
        bgcolor: 'error.50'
      };
    }
    return {
      color: 'success',
      icon: <Security />,
      text: 'Compliant',
      bgcolor: 'success.50'
    };
  };

  const formatLocation = (location) => {
    if (typeof location === 'string') return location;
    return location?.address || 'Unknown Location';
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'string' && duration.includes(':')) {
      const [hours, minutes] = duration.split(':');
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return `${distance} miles`;
  };

  const getStopsCount = () => {
    return trip.stops ? trip.stops.length : 0;
  };

  const getAvailableActions = () => {
    const actions = [];
    
    switch (trip.status?.toLowerCase()) {
      case 'planned':
        actions.push({
          label: 'Begin Journey',
          icon: <PlayArrow />,
          action: handleBeginJourney,
          color: 'success',
          variant: 'contained'
        });
        actions.push({
          label: 'Cancel Journey',
          icon: <Cancel />,
          action: handleCancelJourney,
          color: 'error',
          variant: 'outlined'
        });
        break;
        
      case 'active':
        actions.push({
          label: 'Complete Journey',
          icon: <CheckCircle />,
          action: handleCompleteJourney,
          color: 'success',
          variant: 'contained'
        });
        actions.push({
          label: 'Cancel Journey',
          icon: <Cancel />,
          action: handleCancelJourney,
          color: 'error',
          variant: 'outlined'
        });
        break;
        
      case 'completed':
      case 'cancelled':
        // No actions available for completed/cancelled trips
        break;
        
      default:
        actions.push({
          label: 'Begin Journey',
          icon: <PlayArrow />,
          action: handleBeginJourney,
          color: 'primary',
          variant: 'contained'
        });
    }
    
    return actions;
  };

  const complianceStatus = getComplianceStatus();
  const availableActions = getAvailableActions();

  return (
    <>
      <Card
        sx={{
          transition: 'all 0.2s ease',
          opacity: isDeleting ? 0.5 : 1,
          position: 'relative',
          '&:hover': !isDeleting ? {
            transform: 'translateY(-2px)',
            boxShadow: 4,
            borderColor: 'warning.main'
          } : {},
          border: 2,
          borderColor: 'grey.200'
        }}
      >
        <CardHeader
          sx={{ 
            bgcolor: 'grey.50',
            borderBottom: 1,
            borderColor: 'grey.200',
            pb: 1
          }}
          title={
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography variant={compact ? "h6" : "h5"} component="div" gutterBottom>
                  {formatLocation(trip.pickup_location)} → {formatLocation(trip.dropoff_location)}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Straighten fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDistance(trip.total_distance)}
                  </Typography>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(trip.estimated_duration)}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <CalendarToday fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {trip.planned_start_time 
                      ? new Date(trip.planned_start_time).toLocaleDateString()
                      : new Date(trip.created_at).toLocaleDateString()
                    }
                    {trip.estimated_end_time && 
                      ` - ${new Date(trip.estimated_end_time).toLocaleDateString()}`
                    }
                  </Typography>
                </Box>
              </Box>
              
              <Chip
                icon={getStatusIcon(trip.status)}
                label={trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1) || 'Unknown'}
                color={getStatusColor(trip.status)}
                size="small"
              />
            </Box>
          }
        />

        <CardContent>
          <Grid container spacing={1.5} mb={1.5}>
            <Grid item xs={compact ? 6 : 4}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Cycle Hours
                </Typography>
                <Typography variant={compact ? "body1" : "h6"} fontWeight="bold">
                  {trip.current_cycle_hours || 0}h
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={compact ? 6 : 4}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Stops
                </Typography>
                <Typography variant={compact ? "body1" : "h6"} fontWeight="bold">
                  {getStopsCount()}
                </Typography>
              </Paper>
            </Grid>
            
            {!compact && (
              <Grid item xs={4}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Driver
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {trip.driver_email?.split('@')[0] || 'Unknown'}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* HOS Compliance Status */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            p={1}
            bgcolor={complianceStatus.bgcolor}
            borderRadius={1}
            mb={1.5}
          >
            <Box color={`${complianceStatus.color}.main`}>
              {complianceStatus.icon}
            </Box>
            <Typography variant="body2">
              HOS Status: <strong>{complianceStatus.text}</strong>
            </Typography>
          </Box>

          {/* HOS Violations Alert */}
          {trip.hos_violations && trip.hos_violations.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight="bold">Violations:</Typography>
              {trip.hos_violations.map((violation, index) => (
                <Typography key={index} variant="body2">• {violation}</Typography>
              ))}
            </Alert>
          )}

          <Collapse in={isExpanded}>
            <Paper sx={{ p: 1.5, bgcolor: 'grey.50', mt: 1.5 }}>
              <Typography variant="body2" color="text.secondary" paragraph fontStyle="italic">
                <strong>Current Location:</strong> {formatLocation(trip.current_location)}
              </Typography>
              
              {trip.stops && trip.stops.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Planned Stops:
                  </Typography>
                  {trip.stops.slice(0, 3).map((stop, index) => (
                    <Box key={stop.id || index} display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Chip 
                        label={stop.stop_type} 
                        size="small" 
                        color={stop.is_mandatory ? 'error' : 'default'}
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatLocation(stop.location)} ({stop.duration_minutes}min)
                      </Typography>
                    </Box>
                  ))}
                  {trip.stops.length > 3 && (
                    <Typography variant="body2" color="text.secondary">
                      ... and {trip.stops.length - 3} more stops
                    </Typography>
                  )}
                </Box>
              )}

              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Driver: {trip.driver_email || 'Unknown'}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(trip.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Collapse>

          {showActions && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  size="small"
                  color="warning"
                  startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Less' : 'More'}
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<Visibility />}
                  onClick={() => setModalOpen(true)}
                >
                  View Details
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>

        {isDeleting && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Card>

      {/* Trip Details Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" component="div">
                Trip Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatLocation(trip.pickup_location)} → {formatLocation(trip.dropoff_location)}
              </Typography>
            </Box>
            <IconButton onClick={() => setModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Trip Overview */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Route sx={{ mr: 1 }} /> Trip Overview
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusIcon(trip.status)}
                    label={trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
                    color={getStatusColor(trip.status)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Distance</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDistance(trip.total_distance)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Estimated Duration</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDuration(trip.estimated_duration)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Planned Start</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {trip.planned_start_time 
                      ? new Date(trip.planned_start_time).toLocaleString()
                      : 'Not scheduled'
                    }
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Locations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <LocationOn sx={{ mr: 1 }} /> Locations
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Current Location</Typography>
                  <Typography variant="body1">
                    {formatLocation(trip.current_location)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Pickup Location</Typography>
                  <Typography variant="body1">
                    {formatLocation(trip.pickup_location)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Dropoff Location</Typography>
                  <Typography variant="body1">
                    {formatLocation(trip.dropoff_location)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* HOS Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: complianceStatus.bgcolor }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Security sx={{ mr: 1 }} /> HOS Compliance
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Box color={`${complianceStatus.color}.main`}>
                    {complianceStatus.icon}
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    Status: {complianceStatus.text}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Current Cycle Hours: <strong>{trip.current_cycle_hours || 0}h / 70h</strong>
                </Typography>

                {trip.hos_violations && trip.hos_violations.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold">Violations:</Typography>
                    {trip.hos_violations.map((violation, index) => (
                      <Typography key={index} variant="body2">• {violation}</Typography>
                    ))}
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setModalOpen(false)}
            disabled={actionLoading}
          >
            Close
          </Button>
          
          <Stack direction="row" spacing={1}>
            {availableActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                color={action.color}
                startIcon={actionLoading ? <CircularProgress size={16} /> : action.icon}
                onClick={action.action}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : action.label}
              </Button>
            ))}
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

const TripCardList = ({ 
  trips: propTrips,
  onViewDetails, 
  onDeleteTrip, 
  onTripStatusChange,
  title = "Trip History",
  emptyMessage = "No trips found",
  compact = false 
}) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      // If trips are passed as props, use them
      if (propTrips) {
        setTrips(propTrips);
        setLoading(false);
        return;
      }

      // Otherwise, fetch from API
      try {
        setLoading(true);
        setError(null);
        const response = await tripService.getTrips();
        setTrips(response.results || response); // Handle both paginated and direct array responses
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError(apiUtils.formatError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [propTrips]);

  const handleTripDeleted = (tripId) => {
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
    if (onDeleteTrip) {
      onDeleteTrip(tripId);
    }
  };

  const handleTripStatusChanged = (tripId, newStatus) => {
    // Update local trip status
    setTrips(prevTrips => 
      prevTrips.map(trip => 
        trip.id === tripId 
          ? { ...trip, status: newStatus }
          : trip
      )
    );
    
    if (onTripStatusChange) {
      onTripStatusChange(tripId, newStatus);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Assignment color="primary" sx={{ mr: 1 }} />
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

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Assignment color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
          </Box>
          <Alert severity="error">
            Failed to load trips: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2.5}>
          <Assignment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        
        {!trips || trips.length === 0 ? (
          <Box textAlign="center" py={5}>
            <LocalShipping sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {trips.map((trip) => (
              <Grid item xs={12} md={compact ? 6 : 12} key={trip.id}>
                <TripCard
                  trip={trip}
                  onViewDetails={onViewDetails}
                  onDeleteTrip={handleTripDeleted}
                  onTripStatusChange={handleTripStatusChanged}
                  compact={compact}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default TripCard;
export { TripCardList };