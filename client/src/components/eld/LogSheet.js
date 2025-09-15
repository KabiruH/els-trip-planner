import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  Schedule,
  Person,
  LocalShipping
} from '@mui/icons-material';

const LogSheet = ({ 
  date = new Date().toISOString().split('T')[0],
  driverName = 'John Smith',
  vehicleNumber = 'TRK-001',
  logEntries = [],
  onLogUpdate = () => {},
  readOnly = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState(1);

  const dutyStatuses = [
    { id: 1, label: 'OFF DUTY', color: 'success', shortLabel: 'OFF' },
    { id: 2, label: 'SLEEPER BERTH', color: 'primary', shortLabel: 'SLB' },
    { id: 3, label: 'DRIVING', color: 'error', shortLabel: 'DRV' },
    { id: 4, label: 'ON DUTY (NOT DRIVING)', color: 'warning', shortLabel: 'ON' }
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push({
          hour,
          quarter,
          time: timeString,
          displayTime: minutes === 0 ? `${hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}${hour < 12 ? 'AM' : 'PM'}` : ''
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotClick = (slotIndex) => {
    if (readOnly) return;
    
    const newEntry = {
      time: timeSlots[slotIndex].time,
      status: selectedStatus,
      timestamp: Date.now()
    };
    
    onLogUpdate([...logEntries, newEntry]);
  };

  const getStatusForSlot = (slotIndex) => {
    const slotTime = timeSlots[slotIndex].time;
    const relevantEntry = logEntries
      .filter(entry => entry.time <= slotTime)
      .sort((a, b) => b.time.localeCompare(a.time))[0];
    
    return relevantEntry ? relevantEntry.status : 1;
  };

  const calculateTotals = () => {
    const totals = { 1: 0, 2: 0, 3: 0, 4: 0 };
    
    for (let i = 0; i < timeSlots.length; i++) {
      const status = getStatusForSlot(i);
      totals[status] += 0.25;
    }
    
    return totals;
  };

  const totals = calculateTotals();

  const getStatusColorValue = (colorName) => {
    const colorMap = {
      success: '#2e7d32',
      primary: '#1976d2', 
      error: '#d32f2f',
      warning: '#f57c00'
    };
    return colorMap[colorName] || '#666';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Driver's Daily Log
        </Typography>
        
        {/* Header Info */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">
                    DATE
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">
                    DRIVER
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {driverName}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <LocalShipping sx={{ mr: 1, color: 'text.secondary' }} />
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">
                    VEHICLE
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {vehicleNumber}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Status Selector */}
        {!readOnly && (
          <Box mb={2}>
            <Typography variant="body2" fontWeight={500} color="text.secondary" mb={1}>
              Select Status to Mark:
            </Typography>
            <ButtonGroup variant="outlined" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {dutyStatuses.map(status => (
                <Button
                  key={status.id}
                  variant={selectedStatus === status.id ? 'contained' : 'outlined'}
                  color={status.color}
                  onClick={() => setSelectedStatus(status.id)}
                  size="small"
                >
                  {status.shortLabel}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        )}

        {/* Time Labels */}
        <Box display="flex" mb={1} pl="120px">
          {Array.from({ length: 24 }, (_, hour) => (
            <Box
              key={hour}
              sx={{
                width: 32,
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" fontWeight={500}>
                {hour === 0 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour - 12}P`}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Log Grid */}
        <Paper sx={{ border: 2, borderColor: 'grey.800', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          {dutyStatuses.map((status, statusIndex) => (
            <Box 
              key={status.id} 
              display="flex" 
              borderBottom={statusIndex < dutyStatuses.length - 1 ? 2 : 0} 
              borderColor="grey.800"
            >
              <Box
                sx={{
                  width: 120,
                  p: 1,
                  bgcolor: getStatusColorValue(status.color),
                  color: 'white',
                  borderRight: 2,
                  borderColor: 'grey.800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" fontWeight="bold" align="center">
                  {status.label}
                </Typography>
              </Box>
              <Box display="flex" flex={1}>
                {timeSlots.map((slot, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 32,
                      bgcolor: getStatusForSlot(index) === status.id 
                        ? getStatusColorValue(status.color) 
                        : 'white',
                      borderRight: slot.quarter === 3 ? '2px solid #666' : '1px solid #ddd',
                      cursor: readOnly ? 'default' : 'pointer',
                      transition: 'background-color 0.1s ease',
                      '&:hover': !readOnly ? {
                        opacity: 0.8
                      } : {}
                    }}
                    onClick={() => handleTimeSlotClick(index)}
                    title={`${slot.time} - ${status.label}`}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Totals */}
        <Grid container spacing={2}>
          {dutyStatuses.map(status => (
            <Grid item xs={12} sm={6} md={3} key={status.id}>
              <Paper sx={{ p: 1.5, textAlign: 'center', border: 1, borderColor: 'grey.200' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {status.label}
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: getStatusColorValue(status.color) }}>
                  {totals[status.id].toFixed(1)}h
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LogSheet;