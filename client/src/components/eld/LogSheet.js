import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Schedule,
  Person,
  LocalShipping,
  Save,
  Check
} from '@mui/icons-material';
import { eldLogsService, driverService, authService, apiUtils } from '../../services/api';

const LogSheet = ({ 
  date = new Date().toISOString().split('T')[0],
  readOnly = false,
  onLogUpdate = null
}) => {
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [logData, setLogData] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [location, setLocation] = useState('');

  const dutyStatuses = [
    { id: 1, value: 'off_duty', label: 'OFF DUTY', color: 'success', shortLabel: 'OFF' },
    { id: 2, value: 'sleeper_berth', label: 'SLEEPER BERTH', color: 'primary', shortLabel: 'SLB' },
    { id: 3, value: 'driving', label: 'DRIVING', color: 'error', shortLabel: 'DRV' },
    { id: 4, value: 'on_duty_not_driving', label: 'ON DUTY (NOT DRIVING)', color: 'warning', shortLabel: 'ON' }
  ];

  useEffect(() => {
    fetchLogData();
    fetchDriverInfo();
  }, [date]);

  const fetchLogData = async () => {
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

      if (logResponse) {
        setLogData(logResponse);
        setLogEntries(logResponse.log_entries || []);
      } else {
        // Create empty log for the date
        setLogData({ date, log_entries: [] });
        setLogEntries([]);
      }

    } catch (err) {
      console.error('Error fetching log data:', err);
      setError('Failed to load log data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverInfo = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setDriverInfo(currentUser);
      } else {
        const profile = await driverService.getProfile();
        setDriverInfo(profile);
      }
    } catch (err) {
      console.error('Error fetching driver info:', err);
    }
  };

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

  const handleTimeSlotClick = async (slotIndex) => {
    if (readOnly) return;
    
    const slotTime = timeSlots[slotIndex].time;
    
    // Prepare the status change
    setPendingStatusChange({
      time: slotTime,
      status: selectedStatus,
      duty_status: dutyStatuses.find(s => s.id === selectedStatus)?.value
    });
    
    // Show location dialog for status changes
    setShowLocationDialog(true);
  };

  const handleStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      setSaving(true);
      
      // Get current location if not provided
      let currentLocation = location;
      if (!currentLocation) {
        try {
          const geoLocation = await apiUtils.getCurrentLocation();
          currentLocation = geoLocation.address;
        } catch {
          currentLocation = 'Location not available';
        }
      }

      const dutyChangeData = {
        duty_status: pendingStatusChange.duty_status,
        timestamp: `${date}T${pendingStatusChange.time}:00`,
        location: currentLocation,
        notes: ''
      };

      // Add duty status change
      await eldLogsService.addDutyChange(dutyChangeData);
      
      // Refresh log data
      await fetchLogData();
      
      // Call parent callback if provided
      if (onLogUpdate) {
        onLogUpdate();
      }

      setShowLocationDialog(false);
      setLocation('');
      setPendingStatusChange(null);

    } catch (err) {
      console.error('Error adding duty change:', err);
      setError(apiUtils.formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const getStatusForSlot = (slotIndex) => {
    const slotTime = timeSlots[slotIndex].time;
    const slotDateTime = new Date(`${date}T${slotTime}:00`);
    
    // Find the most recent entry before or at this time slot
    const relevantEntry = logEntries
      .filter(entry => {
        const entryTime = new Date(entry.timestamp);
        return entryTime <= slotDateTime;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (relevantEntry) {
      const statusMap = {
        'off_duty': 1,
        'sleeper_berth': 2,
        'driving': 3,
        'on_duty_not_driving': 4
      };
      return statusMap[relevantEntry.duty_status] || 1;
    }
    
    return 1; // Default to off duty
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

  const certifyLog = async () => {
    if (!logData?.id) return;
    
    try {
      setSaving(true);
      await eldLogsService.certifyLog(logData.id);
      await fetchLogData(); // Refresh to get updated certification status
    } catch (err) {
      console.error('Error certifying log:', err);
      setError(apiUtils.formatError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            Driver's Daily Log
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
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
                      {driverInfo ? `${driverInfo.first_name} ${driverInfo.last_name}` : 'Loading...'}
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
                      {driverInfo?.vehicle_number || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* Certification Status */}
            {logData?.is_certified && (
              <Box mt={2} display="flex" justifyContent="center">
                <Alert 
                  icon={<Check />} 
                  severity="success"
                  sx={{ width: 'fit-content' }}
                >
                  Log Certified
                </Alert>
              </Box>
            )}
          </Paper>

          {/* Status Selector */}
          {!readOnly && !logData?.is_certified && (
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
                        cursor: (!readOnly && !logData?.is_certified) ? 'pointer' : 'default',
                        transition: 'background-color 0.1s ease',
                        '&:hover': (!readOnly && !logData?.is_certified) ? {
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
          <Grid container spacing={2} mb={2}>
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

          {/* Certify Button */}
          {!readOnly && !logData?.is_certified && date !== new Date().toISOString().split('T')[0] && (
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                onClick={certifyLog}
                disabled={saving}
              >
                {saving ? 'Certifying...' : 'Certify Log'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Location Dialog */}
      <Dialog open={showLocationDialog} onClose={() => setShowLocationDialog(false)}>
        <DialogTitle>Add Duty Status Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Adding {dutyStatuses.find(s => s.id === selectedStatus)?.label} at {pendingStatusChange?.time}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter current location"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLocationDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Adding...' : 'Add Status Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogSheet;