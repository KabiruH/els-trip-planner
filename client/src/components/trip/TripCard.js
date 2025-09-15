import React, { useState } from 'react';
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
  Divider
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
  Assignment
} from '@mui/icons-material';

const TripCard = ({ 
  trip,
  onViewDetails,
  onDeleteTrip,
  showActions = true,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setIsDeleting(true);
      try {
        await onDeleteTrip(trip.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'planned': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle />;
      case 'in-progress': return <LocalShipping />;
      case 'planned': return <CalendarToday />;
      case 'cancelled': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const defaultTrip = {
    id: 'trip-001',
    from: 'Chicago, IL',
    to: 'Atlanta, GA',
    status: 'completed',
    startDate: '2025-09-10',
    endDate: '2025-09-11',
    distance: '716 miles',
    duration: '11h 30m',
    driver: 'John Smith',
    vehicle: 'TRK-001',
    hoursUsed: 8.5,
    fuelStops: 2,
    complianceStatus: 'good',
    notes: 'On-time delivery, no issues'
  };

  const tripData = trip || defaultTrip;

  return (
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
                {tripData.from} → {tripData.to}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Straighten fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {tripData.distance}
                </Typography>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {tripData.duration}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <CalendarToday fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(tripData.startDate).toLocaleDateString()}
                  {tripData.endDate && tripData.endDate !== tripData.startDate && 
                    ` - ${new Date(tripData.endDate).toLocaleDateString()}`
                  }
                </Typography>
              </Box>
            </Box>
            
            <Chip
              icon={getStatusIcon(tripData.status)}
              label={tripData.status}
              color={getStatusColor(tripData.status)}
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
                Hours Used
              </Typography>
              <Typography variant={compact ? "body1" : "h6"} fontWeight="bold">
                {tripData.hoursUsed}h
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={compact ? 6 : 4}>
            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                Fuel Stops
              </Typography>
              <Typography variant={compact ? "body1" : "h6"} fontWeight="bold">
                {tripData.fuelStops}
              </Typography>
            </Paper>
          </Grid>
          
          {!compact && (
            <Grid item xs={4}>
              <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {tripData.vehicle}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {tripData.complianceStatus && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            p={1}
            bgcolor="success.50"
            borderRadius={1}
            mb={1.5}
          >
            <Security color="success" />
            <Typography variant="body2">
              Compliance: <strong>{tripData.complianceStatus.toUpperCase()}</strong>
            </Typography>
          </Box>
        )}

        <Collapse in={isExpanded}>
          <Paper sx={{ p: 1.5, bgcolor: 'grey.50', mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary" paragraph fontStyle="italic">
              <strong>Notes:</strong> {tripData.notes || 'No additional notes'}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Driver: {tripData.driver}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShipping fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Vehicle: {tripData.vehicle}
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
                onClick={() => onViewDetails && onViewDetails(tripData)}
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
  );
};

const TripCardList = ({ 
  trips = [], 
  onViewDetails, 
  onDeleteTrip, 
  title = "Trip History",
  emptyMessage = "No trips found",
  compact = false 
}) => {
  const sampleTrips = trips.length > 0 ? trips : [
    {
      id: 'trip-001',
      from: 'Chicago, IL',
      to: 'Atlanta, GA',
      status: 'completed',
      startDate: '2025-09-10',
      endDate: '2025-09-11',
      distance: '716 miles',
      duration: '11h 30m',
      driver: 'John Smith',
      vehicle: 'TRK-001',
      hoursUsed: 8.5,
      fuelStops: 2,
      complianceStatus: 'good',
      notes: 'On-time delivery, no issues'
    },
    {
      id: 'trip-002',
      from: 'Milwaukee, WI',
      to: 'Detroit, MI',
      status: 'in-progress',
      startDate: '2025-09-12',
      distance: '377 miles',
      duration: '6h 15m',
      driver: 'Sarah Johnson',
      vehicle: 'TRK-002',
      hoursUsed: 4.2,
      fuelStops: 1,
      complianceStatus: 'good',
      notes: 'Currently en route'
    },
    {
      id: 'trip-003',
      from: 'Green Bay, WI',
      to: 'Minneapolis, MN',
      status: 'planned',
      startDate: '2025-09-15',
      distance: '304 miles',
      duration: '5h 45m',
      driver: 'John Smith',
      vehicle: 'TRK-001',
      hoursUsed: 0,
      fuelStops: 1,
      complianceStatus: 'pending',
      notes: 'Scheduled for next week'
    }
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2.5}>
          <Assignment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        
        {sampleTrips.length === 0 ? (
          <Box textAlign="center" py={5}>
            <LocalShipping sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {sampleTrips.map((trip) => (
              <Grid item xs={12} md={compact ? 6 : 12} key={trip.id}>
                <TripCard
                  trip={trip}
                  onViewDetails={onViewDetails}
                  onDeleteTrip={onDeleteTrip}
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