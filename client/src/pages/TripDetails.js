import React, { useState, useEffect } from 'react';
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
    Container,
    Paper,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Save,
    PlayArrow,
    CheckCircle,
    Assessment,
    Schedule,
    Map,
    Warning,
    Error as ErrorIcon,
    LocationOn,
    Route
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Import API services
import { tripService, eldLogsService, driverService, authService, apiUtils } from '../services/api';

// Import your existing components (now they use live data)
import ComplianceCard from '../components/eld/ComplianceCard';
import LogSheet from '../components/eld/LogSheet';
import TimelineView from '../components/eld/TimelineView';
import RouteMap from '../components/map/RouteMap';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const TripDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [driverData, setDriverData] = useState(null);

    useEffect(() => {
        initializeTripDetails();
    }, []);

    const initializeTripDetails = async () => {
        try {
            setLoading(true);
            
            // Debug: Log what we're receiving
            console.log('Location state:', location.state);
            console.log('URL params:', params);
            
            // Get trip data from location state (from trip planning) or fetch by ID
            let trip = location.state?.tripPlan;
            
            if (!trip && params.tripId) {
                console.log('Fetching trip by ID:', params.tripId);
                // Fetch trip by ID if coming from direct link
                trip = await tripService.getTripById(params.tripId);
            }
            
            // If still no trip data, show helpful error
            if (!trip) {
                console.error('No trip data found in location.state or params');
                console.log('Available location.state keys:', Object.keys(location.state || {}));
                
                // Check alternative state keys
                if (location.state?.tripData) {
                    trip = location.state.tripData;
                } else if (location.state?.trip) {
                    trip = location.state.trip;
                } else {
                    throw new Error('No trip data available. Please navigate from trip planning, trip history, or provide a valid trip ID in the URL.');
                }
            }

            console.log('Trip data loaded:', trip);

            // Get driver info
            const driver = await driverService.getProfile();
            console.log('Driver data loaded:', driver);
            
            setTripData(trip);
            setDriverData(driver);

        } catch (err) {
            console.error('Error loading trip details:', err);
            setError(err.message || 'Failed to load trip details');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleStartTrip = async () => {
        if (!tripData?.id) return;
        
        try {
            setStarting(true);
            
            // Update trip status to active
            await tripService.updateTrip(tripData.id, { status: 'active' });
            
            // Add initial duty status change if needed
            try {
                await eldLogsService.addDutyChange({
                    duty_status: 'on_duty_not_driving',
                    timestamp: new Date().toISOString(),
                    location: tripData.current_location?.address || 'Trip Start Location',
                    notes: `Started trip: ${tripData.pickup_location?.address} to ${tripData.dropoff_location?.address}`
                });
            } catch (logError) {
                console.warn('Could not add initial duty status:', logError);
            }
            
            // Navigate to dashboard
            navigate('/dashboard', { 
                state: { 
                    message: 'Trip started successfully!',
                    activeTrip: tripData
                }
            });

        } catch (err) {
            console.error('Error starting trip:', err);
            setError(apiUtils.formatError(err));
        } finally {
            setStarting(false);
        }
    };

    const handleSaveTrip = async () => {
        if (!tripData) return;
        
        try {
            setSaving(true);
            
            // If trip doesn't have an ID, create it
            if (!tripData.id) {
                const savedTrip = await tripService.createTrip({
                    pickup_location: tripData.pickup_location,
                    dropoff_location: tripData.dropoff_location,
                    current_location: tripData.current_location,
                    total_distance: tripData.total_distance,
                    estimated_duration: tripData.estimated_duration,
                    stops: tripData.stops || [],
                    status: 'planned',
                    notes: tripData.notes || ''
                });
                setTripData(savedTrip);
            }
            
            alert('Trip saved successfully!');

        } catch (err) {
            console.error('Error saving trip:', err);
            setError(apiUtils.formatError(err));
        } finally {
            setSaving(false);
        }
    };

    const getLocationName = (location) => {
        if (!location) return 'Unknown';
        if (typeof location === 'string') return location;
        return location.address || location.name || 'Unknown';
    };

    const getStopTypeIcon = (stopType) => {
        switch (stopType) {
            case 'pickup': return '📦';
            case 'dropoff': return '🎯';
            case 'fuel': return '⛽';
            case 'rest': return '🛏️';
            case 'break': return '☕';
            default: return '📍';
        }
    };

    const getComplianceStatus = () => {
        if (!tripData) return { status: 'unknown', message: 'Loading...' };
        
        if (tripData.hos_compliant === true || tripData.is_hos_compliant === true) {
            return { status: 'compliant', message: 'HOS Compliant' };
        } else if (tripData.hos_compliant === false || tripData.is_hos_compliant === false) {
            return { status: 'violation', message: 'HOS Violation' };
        } else if (tripData.warnings && tripData.warnings.length > 0) {
            return { status: 'warning', message: 'HOS Warning' };
        }
        
        return { status: 'compliant', message: 'HOS Compliant' };
    };

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
                        <Box textAlign="center">
                            <CircularProgress size={60} sx={{ mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                Loading trip details...
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        );
    }

    if (error || !tripData) {
        return (
            <Box sx={{ 
                minHeight: '100vh', 
                bgcolor: 'grey.50',
                pt: 3,
                pb: 4
            }}>
                <Container maxWidth="lg">
                    <Alert 
                        severity="error" 
                        sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            No Trip Data Available
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {error || 'No trip data found'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try accessing this page from:
                        </Typography>
                        <ul>
                            <li>Trip planning results</li>
                            <li>Trip history "View Details" button</li>
                            <li>Or ensure the URL includes a valid trip ID</li>
                        </ul>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/dashboard')}
                            sx={{ mt: 2 }}
                        >
                            Go to Dashboard
                        </Button>
                    </Alert>
                </Container>
            </Box>
        );
    }

    const compliance = getComplianceStatus();
    const fromLocation = getLocationName(tripData.pickup_location);
    const toLocation = getLocationName(tripData.dropoff_location);

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: 'grey.50',
            pt: 3,
            pb: 4,
            mt:8
        }}>
            <Container maxWidth="lg">
                {/* Header Info */}
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {fromLocation} → {toLocation}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                {tripData.total_distance && (
                                    <Chip 
                                        label={`${tripData.total_distance} miles`}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {tripData.estimated_duration && (
                                    <Chip 
                                        label={tripData.estimated_duration}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {tripData.planned_start_time && (
                                    <Chip 
                                        label={new Date(tripData.planned_start_time).toLocaleDateString()}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </Box>
                        </Box>
                        
                        <Stack direction="row" spacing={2}>
                            <Button
                                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                                variant="outlined"
                                onClick={handleSaveTrip}
                                disabled={saving}
                                sx={{ borderRadius: 3 }}
                            >
                                {saving ? 'Saving...' : 'Save Trip'}
                            </Button>
                            <Button
                                startIcon={starting ? <CircularProgress size={16} /> : <PlayArrow />}
                                variant="contained"
                                onClick={handleStartTrip}
                                disabled={starting || compliance.status === 'violation'}
                                sx={{ borderRadius: 3 }}
                            >
                                {starting ? 'Starting...' : 'Start Trip'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>

                {/* HOS Warnings */}
                {tripData.warnings && tripData.warnings.length > 0 && (
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Typography variant="body1" fontWeight="bold">HOS Warnings:</Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {tripData.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {compliance.status === 'violation' && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Typography variant="body1" fontWeight="bold">
                            Cannot Start Trip - HOS Violation
                        </Typography>
                        <Typography variant="body2">
                            This trip plan violates Hours of Service regulations. Please modify the plan or take required rest.
                        </Typography>
                    </Alert>
                )}

                {/* Trip Summary */}
                <Card sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'grey.100'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" component="h2">
                                Trip Summary
                            </Typography>
                            <Chip
                                icon={compliance.status === 'compliant' ? <CheckCircle /> : 
                                      compliance.status === 'warning' ? <Warning /> : <ErrorIcon />}
                                label={compliance.message}
                                color={compliance.status === 'compliant' ? 'success' : 
                                       compliance.status === 'warning' ? 'warning' : 'error'}
                                variant="filled"
                            />
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={2}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Driver
                                    </Typography>
                                    <Typography variant="h6">
                                        {driverData ? `${driverData.first_name} ${driverData.last_name}` : 'Loading...'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Vehicle
                                    </Typography>
                                    <Typography variant="h6">
                                        {driverData?.vehicle_number || 'N/A'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Distance
                                    </Typography>
                                    <Typography variant="h6">
                                        {tripData.total_distance ? `${tripData.total_distance} mi` : 'TBD'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Est. Time
                                    </Typography>
                                    <Typography variant="h6">
                                        {tripData.estimated_duration || 'TBD'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Total Stops
                                    </Typography>
                                    <Typography variant="h6">
                                        {tripData.stops ? tripData.stops.length : 0}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Rest Breaks
                                    </Typography>
                                    <Typography variant="h6">
                                        {tripData.stops ? tripData.stops.filter(stop => stop.type === 'rest').length : 0}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Stops Summary */}
                        {tripData.stops && tripData.stops.length > 0 && (
                            <Box mt={3}>
                                <Typography variant="h6" gutterBottom>
                                    Planned Stops
                                </Typography>
                                <Grid container spacing={2}>
                                    {tripData.stops.map((stop, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={stop.id || index}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="h6">
                                                        {getStopTypeIcon(stop.type)}
                                                    </Typography>
                                                    <Box flex={1}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {stop.location || stop.address}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {stop.type?.replace('_', ' ').toUpperCase()}
                                                            {stop.estimated_arrival && ` • ${stop.estimated_arrival}`}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Paper sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'grey.100'
                }}>
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
                            <Grid item xs={12} xl={6}>
                                <ComplianceCard />
                            </Grid>
                            <Grid item xs={12} xl={6}>
                                <TimelineView 
                                    date={tripData.planned_start_time ? 
                                        tripData.planned_start_time.split('T')[0] : 
                                        new Date().toISOString().split('T')[0]
                                    }
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <LogSheet
                            date={tripData.planned_start_time ? 
                                tripData.planned_start_time.split('T')[0] : 
                                new Date().toISOString().split('T')[0]
                            }
                            readOnly={true}
                        />
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                        <RouteMap
                            tripData={tripData}
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