import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Paper,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Timeline,
  ViewList,
  LocationOn,
  Home,
  Hotel,
  DirectionsCar,
  Build
} from '@mui/icons-material';
import { eldLogsService, authService } from '../../services/api';

const TimelineView = ({ 
  date = new Date().toISOString().split('T')[0],
  showControls = true 
}) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [driverName, setDriverName] = useState('');

  const dutyStatuses = {
    'off_duty': { label: 'Off Duty', color: 'success', icon: <Home /> },
    'sleeper_berth': { label: 'Sleeper Berth', color: 'primary', icon: <Hotel /> },
    'driving': { label: 'Driving', color: 'error', icon: <DirectionsCar /> },
    'on_duty_not_driving': { label: 'On Duty', color: 'warning', icon: <Build /> }
  };

  useEffect(() => {
    fetchTimelineData();
    fetchDriverInfo();
  }, [date]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      
      // Determine which endpoint to use based on date
      const today = new Date().toISOString().split('T')[0];
      let logResponse;
      
      if (date === today) {
        logResponse = await eldLogsService.getTodaysLog();
      } else {
        // For historical dates, get daily logs and filter
        const allLogs = await eldLogsService.getDailyLogs();
        logResponse = allLogs.find(log => log.date === date);
      }

      if (logResponse && logResponse.log_entries) {
        // Sort entries by timestamp
        const sortedEntries = logResponse.log_entries.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setLogEntries(sortedEntries);
      } else {
        setLogEntries([]);
      }

    } catch (err) {
      console.error('Error fetching timeline data:', err);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverInfo = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setDriverName(`${currentUser.first_name} ${currentUser.last_name}`);
      }
    } catch (err) {
      console.error('Error fetching driver info:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const calculateDuration = (startTimestamp, endTimestamp) => {
    if (!endTimestamp) return 'Ongoing';
    
    const start = new Date(startTimestamp);
    const end = new Date(endTimestamp);
    const diffMs = end - start;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getTimelineSegments = () => {
    const segments = [];
    
    for (let i = 0; i < logEntries.length; i++) {
      const entry = logEntries[i];
      const nextEntry = logEntries[i + 1];
      
      // Calculate duration
      const duration = nextEntry 
        ? calculateDuration(entry.timestamp, nextEntry.timestamp)
        : calculateDuration(entry.timestamp, new Date().toISOString());
      
      segments.push({
        id: entry.id,
        time: formatTime(entry.timestamp),
        timestamp: entry.timestamp,
        status: entry.duty_status,
        location: entry.location || 'Location not recorded',
        notes: entry.notes || '',
        duration,
        index: i
      });
    }
    
    return segments;
  };

  const segments = getTimelineSegments();

  // Create sample data if no real entries exist
  const displaySegments = segments.length > 0 ? segments : [
    { 
      time: '06:00', 
      status: 'on_duty_not_driving', 
      location: 'Terminal', 
      notes: 'Pre-trip inspection',
      duration: '1h',
      index: 0 
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center">
            <Timeline color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Daily Activity Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {new Date(date).toLocaleDateString()} • {driverName}
            </Typography>
          </Box>
          
          {showControls && (
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
                startIcon={<Timeline />}
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'contained' : 'outlined'}
                startIcon={<ViewList />}
                onClick={() => setViewMode('chart')}
              >
                List
              </Button>
            </ButtonGroup>
          )}
        </Box>

        {segments.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No duty status changes recorded for this date.
          </Alert>
        )}

        {viewMode === 'timeline' ? (
          <Box sx={{ position: 'relative', pl: 5 }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                top: 0,
                bottom: 0,
                width: 4,
                background: 'linear-gradient(to bottom, #e0e0e0 0%, #bdbdbd 100%)',
                borderRadius: 1
              }}
            />
            
            {displaySegments.map((segment, index) => (
              <Box key={segment.id || index} sx={{ position: 'relative', mb: 3 }}>
                {/* Timeline Dot */}
                <Avatar
                  sx={{
                    position: 'absolute',
                    left: -32,
                    top: 8,
                    width: 24,
                    height: 24,
                    bgcolor: `${dutyStatuses[segment.status]?.color || 'primary'}.main`,
                    fontSize: 12,
                    boxShadow: 2
                  }}
                >
                  {dutyStatuses[segment.status]?.icon || <Build />}
                </Avatar>
                
                {/* Timeline Content */}
                <Paper
                  sx={{
                    p: 2,
                    ml: 1,
                    bgcolor: selectedEntry === index ? 'primary.50' : 'grey.50',
                    border: selectedEntry === index ? 2 : 1,
                    borderColor: selectedEntry === index ? 'primary.main' : 'grey.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => setSelectedEntry(selectedEntry === index ? null : index)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="span">
                      {segment.time}
                    </Typography>
                    <Chip
                      label={segment.duration}
                      size="small"
                      variant="outlined"
                      sx={{ bgcolor: 'white' }}
                    />
                  </Box>
                  
                  <Chip
                    icon={dutyStatuses[segment.status]?.icon || <Build />}
                    label={dutyStatuses[segment.status]?.label || 'Unknown Status'}
                    color={dutyStatuses[segment.status]?.color || 'primary'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  {segment.location && (
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {segment.location}
                      </Typography>
                    </Box>
                  )}
                  
                  {segment.notes && (
                    <Typography variant="body2" fontWeight={500}>
                      {segment.notes}
                    </Typography>
                  )}

                  {/* Show additional details when expanded */}
                  {selectedEntry === index && segment.timestamp && (
                    <Box mt={1} pt={1} borderTop={1} borderColor="grey.200">
                      <Typography variant="caption" color="text.secondary">
                        Timestamp: {new Date(segment.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {displaySegments.map((segment, index) => (
              <Paper
                key={segment.id || index}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'grey.50',
                  border: 1,
                  borderColor: 'grey.200'
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${dutyStatuses[segment.status]?.color || 'primary'}.main`,
                    fontSize: 16
                  }}
                >
                  {dutyStatuses[segment.status]?.icon || <Build />}
                </Avatar>
                
                <Box flex={1}>
                  <Typography variant="body1" fontWeight="bold">
                    {segment.time} - {segment.duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dutyStatuses[segment.status]?.label || 'Unknown Status'}
                    {segment.location && ` • ${segment.location}`}
                  </Typography>
                  {segment.notes && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      {segment.notes}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* Summary Statistics */}
        {segments.length > 0 && (
          <Box mt={3} pt={2} borderTop={1} borderColor="grey.200">
            <Typography variant="body2" color="text.secondary" align="center">
              {segments.length} duty status change{segments.length !== 1 ? 's' : ''} recorded
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineView;