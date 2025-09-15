import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Paper,
  Avatar
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

const TimelineView = ({ 
  logEntries = [],
  date = new Date().toISOString().split('T')[0],
  driverName = 'John Smith',
  showControls = true 
}) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('timeline');

  const dutyStatuses = {
    1: { label: 'Off Duty', color: 'success', icon: <Home /> },
    2: { label: 'Sleeper Berth', color: 'primary', icon: <Hotel /> },
    3: { label: 'Driving', color: 'error', icon: <DirectionsCar /> },
    4: { label: 'On Duty', color: 'warning', icon: <Build /> }
  };

  const sampleEntries = logEntries.length > 0 ? logEntries : [
    { time: '06:00', status: 4, location: 'Green Bay, WI', activity: 'Pre-trip inspection' },
    { time: '07:00', status: 3, location: 'Green Bay, WI', activity: 'Driving to pickup' },
    { time: '11:30', status: 1, location: 'Paw Paw, IL', activity: '30 min break' },
    { time: '12:00', status: 3, location: 'Paw Paw, IL', activity: 'Continue driving' },
    { time: '17:00', status: 4, location: 'Edwardsville, IL', activity: 'Post-trip inspection' },
    { time: '18:00', status: 1, location: 'Edwardsville, IL', activity: '10 hour break' }
  ];

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTimelineSegments = () => {
    const segments = [];
    const entries = [...sampleEntries].sort((a, b) => a.time.localeCompare(b.time));
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const nextEntry = entries[i + 1];
      const duration = nextEntry ? calculateDuration(entry.time, nextEntry.time) : 'Ongoing';
      
      segments.push({
        ...entry,
        duration,
        index: i
      });
    }
    
    return segments;
  };

  const segments = getTimelineSegments();

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center">
            <Timeline color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Daily Activity Timeline
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
                Chart
              </Button>
            </ButtonGroup>
          )}
        </Box>

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
            
            {segments.map((segment, index) => (
              <Box key={index} sx={{ position: 'relative', mb: 3 }}>
                {/* Timeline Dot */}
                <Avatar
                  sx={{
                    position: 'absolute',
                    left: -32,
                    top: 8,
                    width: 24,
                    height: 24,
                    bgcolor: `${dutyStatuses[segment.status].color}.main`,
                    fontSize: 12,
                    boxShadow: 2
                  }}
                >
                  {dutyStatuses[segment.status].icon}
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
                    icon={dutyStatuses[segment.status].icon}
                    label={dutyStatuses[segment.status].label}
                    color={dutyStatuses[segment.status].color}
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
                  
                  {segment.activity && (
                    <Typography variant="body2" fontWeight={500}>
                      {segment.activity}
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {segments.map((segment, index) => (
              <Paper
                key={index}
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
                    bgcolor: `${dutyStatuses[segment.status].color}.main`,
                    fontSize: 16
                  }}
                >
                  {dutyStatuses[segment.status].icon}
                </Avatar>
                
                <Box flex={1}>
                  <Typography variant="body1" fontWeight="bold">
                    {segment.time} - {segment.duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dutyStatuses[segment.status].label}
                    {segment.location && ` • ${segment.location}`}
                  </Typography>
                  {segment.activity && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      {segment.activity}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineView;