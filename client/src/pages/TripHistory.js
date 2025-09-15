import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  Search,
  FilterList,
  Assignment
} from '@mui/icons-material';

// Import our Material-UI components from the components folder
import { TripCardList } from '../components/trip/TripCard';

const TripHistory = ({ driver = { name: 'John Smith', id: '001' } }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Sample trip history data
  const allTrips = [
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
      status: 'completed',
      startDate: '2025-09-08',
      endDate: '2025-09-08',
      distance: '377 miles',
      duration: '6h 15m',
      driver: 'John Smith',
      vehicle: 'TRK-001',
      hoursUsed: 6.2,
      fuelStops: 1,
      complianceStatus: 'good',
      notes: 'Smooth delivery'
    },
    {
      id: 'trip-003',
      from: 'Green Bay, WI',
      to: 'Minneapolis, MN',
      status: 'completed',
      startDate: '2025-09-05',
      endDate: '2025-09-05',
      distance: '304 miles',
      duration: '5h 45m',
      driver: 'John Smith',
      vehicle: 'TRK-001',
      hoursUsed: 5.8,
      fuelStops: 1,
      complianceStatus: 'good',
      notes: 'Early arrival'
    },
    {
      id: 'trip-004',
      from: 'Madison, WI',
      to: 'Kansas City, MO',
      status: 'cancelled',
      startDate: '2025-09-03',
      distance: '589 miles',
      duration: '9h 15m',
      driver: 'John Smith',
      vehicle: 'TRK-001',
      hoursUsed: 0,
      fuelStops: 0,
      complianceStatus: 'n/a',
      notes: 'Customer cancelled order'
    },
    {
      id: 'trip-005',
      from: 'Chicago, IL',
      to: 'Denver, CO',
      status: 'completed',
      startDate: '2025-09-01',
      endDate: '2025-09-02',
      distance: '996 miles',
      duration: '15h 20m',
      driver: 'John Smith',
      vehicle: 'TRK-001',
      hoursUsed: 11.0,
      fuelStops: 3,
      complianceStatus: 'good',
      notes: 'Long haul, required overnight rest'
    }
  ];

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard');
    alert('Navigating back to dashboard...');
  };

  const handleViewDetails = (trip) => {
    console.log('Viewing trip details:', trip);
    alert(`Viewing details for trip: ${trip.from} → ${trip.to}`);
  };

  const handleDeleteTrip = async (tripId) => {
    console.log('Deleting trip:', tripId);
    alert(`Trip ${tripId} deleted successfully!`);
    // In real app, this would update the trips list
  };

  // Filter and sort trips based on current filters
  const getFilteredTrips = () => {
    let filtered = allTrips;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Sort trips
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case 'distance':
        filtered.sort((a, b) => parseInt(b.distance) - parseInt(a.distance));
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const getDurationMinutes = (duration) => {
            const [hours, minutes] = duration.split('h ');
            return parseInt(hours) * 60 + parseInt(minutes || '0');
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
       
          
          <Box flexGrow={1}>
            <Typography variant="h6" component="div">
              Trip History
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              View and manage your delivery history
            </Typography>
          </Box>

          <Assignment sx={{ fontSize: 32 }} />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
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
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
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
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} bgcolor="white" borderRadius={2} boxShadow={1}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {allTrips.filter(t => t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} bgcolor="white" borderRadius={2} boxShadow={1}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {Math.round(allTrips.reduce((sum, trip) => sum + (trip.hoursUsed || 0), 0) * 10) / 10}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} bgcolor="white" borderRadius={2} boxShadow={1}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {allTrips.reduce((sum, trip) => sum + parseInt(trip.distance || '0'), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Miles
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} bgcolor="white" borderRadius={2} boxShadow={1}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {Math.round((allTrips.filter(t => t.complianceStatus === 'good').length / allTrips.filter(t => t.status === 'completed').length) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliance Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Trip Cards List */}
        <TripCardList
          trips={filteredTrips}
          onViewDetails={handleViewDetails}
          onDeleteTrip={handleDeleteTrip}
          title={`Trip History (${filteredTrips.length} trips)`}
          emptyMessage={
            searchTerm || statusFilter !== 'all' 
              ? 'No trips match your current filters'
              : 'No trips found'
          }
        />
      </Container>
    </Box>
  );
};

export default TripHistory;