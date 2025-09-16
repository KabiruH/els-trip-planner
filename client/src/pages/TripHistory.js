import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Search,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import API services
import { tripService, driverService, apiUtils } from '../services/api';

// Import your existing components
import { TripCardList } from '../components/trip/TripCard';

const TripHistory = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const [driverStats, setDriverStats] = useState(null);

  useEffect(() => {
    fetchTripHistory();
    fetchDriverStats();
  }, []);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch all trips for the current driver
      const response = await tripService.getTrips();
      
      // Handle different response formats
      let tripsData = [];
      if (Array.isArray(response)) {
        tripsData = response;
      } else if (response.results && Array.isArray(response.results)) {
        tripsData = response.results;
      } else if (response.data && Array.isArray(response.data)) {
        tripsData = response.data;
      } else {
        tripsData = [];
      }
      
      // Transform API data to match component expectations
      const transformedTrips = tripsData.map(trip => ({
        id: trip.id,
        from: getLocationName(trip.pickup_location),
        to: getLocationName(trip.dropoff_location),
        status: trip.status,
        startDate: trip.planned_start_time ? trip.planned_start_time.split('T')[0] : trip.created_at.split('T')[0],
        endDate: trip.completed_at ? trip.completed_at.split('T')[0] : null,
        distance: trip.total_distance ? `${trip.total_distance} miles` : 'N/A',
        duration: trip.actual_duration || trip.estimated_duration || 'N/A',
        driver: trip.driver_name || 'Current Driver',
        vehicle: trip.vehicle_number || 'N/A',
        hoursUsed: trip.driving_hours_used || 0,
        fuelStops: trip.stops ? trip.stops.filter(stop => stop.type === 'fuel').length : 0,
        complianceStatus: trip.hos_compliant ? 'good' : 'warning',
        notes: trip.notes || 'No notes',
        // Keep original data for detail view and pass required fields for TripCard
        pickup_location: trip.pickup_location,
        dropoff_location: trip.dropoff_location,
        current_location: trip.current_location,
        total_distance: trip.total_distance,
        estimated_duration: trip.estimated_duration,
        planned_start_time: trip.planned_start_time,
        created_at: trip.created_at,
        stops: trip.stops,
        current_cycle_hours: trip.current_cycle_hours,
        is_hos_compliant: trip.is_hos_compliant,
        hos_violations: trip.hos_violations,
        driver_email: trip.driver_email,
        originalData: trip
      }));

      setTrips(transformedTrips);

    } catch (err) {
      console.error('Error fetching trip history:', err);
      setError('Failed to load trip history: ' + apiUtils.formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverStats = async () => {
    try {
      const stats = await driverService.getStats();
      setDriverStats(stats);
    } catch (err) {
      console.error('Error fetching driver stats:', err);
    }
  };

  const getLocationName = (location) => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    return location.address || location.name || 'Unknown';
  };

  const handleViewDetails = (trip) => {
    if (trip.originalData) {
      navigate(`/trip-details/${trip.id}`, { 
        state: { tripPlan: trip.originalData } 
      });
    } else {
      console.log('Viewing trip details:', trip);
      alert(`Viewing details for trip: ${trip.from} → ${trip.to}`);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await tripService.deleteTrip(tripId);
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      alert('Trip deleted successfully!');
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip: ' + apiUtils.formatError(err));
    }
  };

  // Filter and sort trips based on current filters
  const getFilteredTrips = () => {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case 'distance':
        filtered.sort((a, b) => {
          const aDistance = parseInt(a.distance) || 0;
          const bDistance = parseInt(b.distance) || 0;
          return bDistance - aDistance;
        });
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const getDurationMinutes = (duration) => {
            if (!duration || duration === 'N/A') return 0;
            if (duration.includes('h')) {
              const parts = duration.split('h ');
              const hours = parseInt(parts[0]) || 0;
              const minutes = parseInt(parts[1]) || 0;
              return hours * 60 + minutes;
            }
            return 0;
          };
          return getDurationMinutes(b.duration) - getDurationMinutes(a.duration);
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredTrips = getFilteredTrips();

  const calculateStats = () => {
    if (driverStats) {
      return {
        completed: driverStats.total_trips_completed || 0,
        totalHours: driverStats.total_driving_hours || 0,
        totalMiles: driverStats.total_miles_driven || 0,
        complianceRate: driverStats.compliance_rate || 0
      };
    }

    const completedTrips = trips.filter(t => t.status === 'completed');
    const totalHours = trips.reduce((sum, trip) => sum + (trip.hoursUsed || 0), 0);
    const totalMiles = trips.reduce((sum, trip) => {
      const miles = parseInt(trip.distance) || 0;
      return sum + miles;
    }, 0);
    const complianceRate = completedTrips.length > 0 
      ? Math.round((trips.filter(t => t.complianceStatus === 'good').length / completedTrips.length) * 100)
      : 100;

    return {
      completed: completedTrips.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalMiles,
      complianceRate
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'grey.50',
        pt: 3,
        pb: 4
      }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
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
      pb: 4,
      mt: 8
    }}>
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'white'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ 
                    borderRadius: 3,
                    bgcolor: 'white'
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="planned">Planned</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ 
                    borderRadius: 3,
                    bgcolor: 'white'
                  }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="distance">Longest Distance</MenuItem>
                  <MenuItem value="duration">Longest Duration</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <FilterList />
                <Typography variant="body2" color="text.secondary">
                  {filteredTrips.length} trips
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Trip Statistics Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'grey.100'
            }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'grey.100'
            }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {stats.totalHours}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'grey.100'
            }}>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {stats.totalMiles.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Miles
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'grey.100'
            }}>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {stats.complianceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliance Rate
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Trip Cards List */}
        <TripCardList
          trips={filteredTrips}
          onViewDetails={handleViewDetails}
          onDeleteTrip={handleDeleteTrip}
          title={`Trip History (${filteredTrips.length} trips)`}
          emptyMessage={
            trips.length === 0 
              ? 'No trips found. Start by planning your first trip!'
              : searchTerm || statusFilter !== 'all' 
                ? 'No trips match your current filters'
                : 'No trips found'
          }
        />
      </Container>
    </Box>
  );
};

export default TripHistory;