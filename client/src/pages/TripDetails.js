import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Grid,
    Tabs,
    Tab,
    AppBar,
    Toolbar,
    Container,
    Paper
} from '@mui/material';
import {
    ArrowBack,
    Save,
    PlayArrow,
    CheckCircle,
    Assessment,
    Schedule,
    Map
} from '@mui/icons-material';
import RouteMap from '../components/map/RouteMap';

// Import our Material-UI components from the components folder
import ComplianceCard from '../components/eld/ComplianceCard';
import LogSheet from '../components/eld/LogSheet';
import TimelineView from '../components/eld/TimelineView';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const TripDetails = ({ tripData }) => {
    const [activeTab, setActiveTab] = useState(0);

    const defaultTripData = {
        id: 'trip-001',
        from: 'Green Bay, WI',
        to: 'Atlanta, GA',
        distance: '716 miles',
        estimatedTime: '11h 30m',
        driverName: 'John Smith',
        vehicleNumber: 'TRK-001',
        startDate: '2025-09-15',
        currentCycleHours: 42.5,
        estimatedDrivingTime: 8.5,
        estimatedOnDutyTime: 9.5,
        
        stops: [
    {
      id: 1,
      type: 'pickup',
      location: 'Green Bay, WI',
      address: '123 Industrial Dr, Green Bay, WI 54302',
      time: '08:00 AM',
      duration: '1h 00m',
      notes: 'Loading dock B-4, bring BOL',
      coordinates: [44.5133, -88.0133],
      status: 'planned'
    },
    {
      id: 2,
      type: 'fuel',
      location: 'Indianapolis, IN',
      address: 'Pilot Travel Center, I-65 Exit 103',
      time: '01:30 PM',
      duration: '30m',
      notes: 'Fuel + mandatory 30-min break',
      coordinates: [39.7817, -86.1478],
      status: 'planned'
    },
    {
      id: 3,
      type: 'rest',
      location: 'Nashville, TN',
      address: 'TA Travel Center, I-40 Exit 210',
      time: '06:00 PM',
      duration: '10h 00m',
      notes: 'Mandatory 10-hour rest period',
      coordinates: [36.1627, -86.7816],
      status: 'planned'
    },
    {
      id: 4,
      type: 'dropoff',
      location: 'Atlanta, GA',
      address: '789 Commerce Blvd, Atlanta, GA 30309',
      time: '08:00 AM (+1 day)',
      duration: '1h 00m',
      notes: 'Delivery appointment confirmed',
      coordinates: [33.7490, -84.3880],
      status: 'planned'
    }
]
    };

    const trip = tripData || defaultTripData;

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleBack = () => {
        console.log('Navigating back to trip planning...');
        alert('Navigating back to trip planning...');
    };

    const handleStartTrip = () => {
        console.log('Starting trip with ELD logging...');
        alert('Starting trip with ELD logging...');
    };

    const handleSaveTrip = () => {
        console.log('Trip saved to history!');
        alert('Trip saved to history!');
    };

    return (
        <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Toolbar>

                    <Box flexGrow={1}>
                        <Typography variant="h6" component="div">
                            {trip.from} → {trip.to}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {trip.distance} • {trip.estimatedTime} • {new Date(trip.startDate).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Box display="flex" gap={1}>
                        <Button
                            startIcon={<Save />}
                            color="inherit"
                            variant="outlined"
                            onClick={handleSaveTrip}
                            sx={{
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Save Trip
                        </Button>
                        <Button
                            startIcon={<PlayArrow />}
                            color="warning"
                            variant="contained"
                            onClick={handleStartTrip}
                        >
                            Start Trip
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Trip Summary */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" component="h2">
                                Trip Summary
                            </Typography>
                            <Chip
                                icon={<CheckCircle />}
                                label="HOS Compliant"
                                color="success"
                                variant="filled"
                            />
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Driver
                                    </Typography>
                                    <Typography variant="h6">
                                        {trip.driverName}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Vehicle
                                    </Typography>
                                    <Typography variant="h6">
                                        {trip.vehicleNumber}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Distance
                                    </Typography>
                                    <Typography variant="h6">
                                        {trip.distance}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Est. Time
                                    </Typography>
                                    <Typography variant="h6">
                                        {trip.estimatedTime}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Fuel Stops
                                    </Typography>
                                    <Typography variant="h6">
                                        2 stops
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Rest Breaks
                                    </Typography>
                                    <Typography variant="h6">
                                        1 required
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Paper sx={{ bgcolor: 'white' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab
                            icon={<Assessment />}
                            label="Overview"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<Schedule />}
                            label="ELD Logs"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<Map />}
                            label="Route Map"
                            iconPosition="start"
                        />
                    </Tabs>

                    <TabPanel value={activeTab} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <ComplianceCard
                                    currentCycleHours={trip.currentCycleHours + trip.estimatedDrivingTime}
                                    drivingHoursToday={trip.estimatedDrivingTime}
                                    onDutyHoursToday={trip.estimatedOnDutyTime}
                                    nextRequiredBreak="11:30 AM (30-min break required)"
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <TimelineView />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <LogSheet
                            date={trip.startDate}
                            driverName={trip.driverName}
                            vehicleNumber={trip.vehicleNumber}
                            readOnly={true}
                        />
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                        <RouteMap
                            tripData={trip}
                            onStopSelect={(stop) => {
                                console.log('Selected stop:', stop);
                            }}
                        />
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
};

export default TripDetails;