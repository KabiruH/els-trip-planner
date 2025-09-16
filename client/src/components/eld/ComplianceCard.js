import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assessment,
  Warning,
  CheckCircle,
  Cancel,
  Schedule,
  CalendarToday
} from '@mui/icons-material';
import { driverService, eldLogsService } from '../../services/api';

const ComplianceCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hosData, setHosData] = useState({
    currentCycleHours: 0,
    drivingHoursToday: 0,
    onDutyHoursToday: 0,
    lastBreakTime: null,
    nextRequiredBreak: null,
    canDrive: true,
    cycleTimeRemaining: 70,
    drivingTimeRemaining: 11,
    onDutyTimeRemaining: 14
  });

  useEffect(() => {
    fetchHOSData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchHOSData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchHOSData = async () => {
    try {
      setLoading(true);
      
      // Fetch HOS status and today's log in parallel
      const [hosStatus, hosSummary, todaysLog] = await Promise.all([
        driverService.getHOSStatus(),
        eldLogsService.getHOSSummary(),
        eldLogsService.getTodaysLog()
      ]);

      // Calculate today's hours from log entries
      const calculateTodaysHours = (logEntries) => {
        let drivingHours = 0;
        let onDutyHours = 0;
        
        if (logEntries && logEntries.length > 0) {
          logEntries.forEach(entry => {
            if (entry.duty_status === 'driving') {
              drivingHours += entry.duration || 0;
            } else if (entry.duty_status === 'on_duty_not_driving') {
              onDutyHours += entry.duration || 0;
            }
          });
        }
        
        return { drivingHours, onDutyHours };
      };

      const { drivingHours, onDutyHours } = calculateTodaysHours(todaysLog?.log_entries || []);

      setHosData({
        currentCycleHours: hosSummary?.cycle_hours_used || 0,
        drivingHoursToday: drivingHours,
        onDutyHoursToday: onDutyHours + drivingHours, // On-duty includes driving
        lastBreakTime: hosStatus?.last_break_time,
        nextRequiredBreak: hosStatus?.next_required_break,
        canDrive: hosStatus?.can_drive ?? true,
        cycleTimeRemaining: hosStatus?.cycle_time_remaining || 70,
        drivingTimeRemaining: hosStatus?.driving_time_remaining || 11,
        onDutyTimeRemaining: hosStatus?.on_duty_time_remaining || 14
      });

    } catch (err) {
      console.error('Error fetching HOS data:', err);
      setError('Failed to load HOS compliance data');
    } finally {
      setLoading(false);
    }
  };

  // HOS Rules (70-hour/8-day cycle)
  const maxCycleHours = 70;
  const maxDrivingDaily = 11;
  const maxOnDutyDaily = 14;
  const requiredBreakAfter = 8; // hours of driving

  // Calculate compliance status
  const cycleStatus = hosData.currentCycleHours >= maxCycleHours ? 'violation' : 
                     hosData.currentCycleHours >= maxCycleHours * 0.9 ? 'warning' : 'good';
  
  const drivingStatus = hosData.drivingHoursToday >= maxDrivingDaily ? 'violation' : 
                       hosData.drivingHoursToday >= maxDrivingDaily * 0.9 ? 'warning' : 'good';
  
  const onDutyStatus = hosData.onDutyHoursToday >= maxOnDutyDaily ? 'violation' : 
                      hosData.onDutyHoursToday >= maxOnDutyDaily * 0.9 ? 'warning' : 'good';

  const needsBreak = hosData.drivingHoursToday >= requiredBreakAfter && !hosData.lastBreakTime;

  const getStatusColor = (status) => {
    switch (status) {
      case 'violation': return 'error';
      case 'warning': return 'warning';
      case 'good': return 'success';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'violation': return <Cancel color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'good': return <CheckCircle color="success" />;
      default: return null;
    }
  };

  const getProgressValue = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
        <Box display="flex" alignItems="center" mb={2} pb={1.5} borderBottom={1} borderColor="grey.200">
          <Assessment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h3">
            HOS Compliance Status
          </Typography>
          {!hosData.canDrive && (
            <Alert 
              severity="error" 
              sx={{ ml: 2, py: 0 }}
              icon={<Cancel />}
            >
              CANNOT DRIVE
            </Alert>
          )}
        </Box>

        <Grid container spacing={2} mb={2}>
          {/* 70-Hour Cycle */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  70-Hour Cycle
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontWeight="bold" color={getStatusColor(cycleStatus) + '.main'}>
                    {hosData.currentCycleHours.toFixed(1)}/{maxCycleHours}h
                  </Typography>
                  {getStatusIcon(cycleStatus)}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(hosData.currentCycleHours, maxCycleHours)}
                color={getStatusColor(cycleStatus)}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {hosData.cycleTimeRemaining.toFixed(1)}h remaining
              </Typography>
            </Box>
          </Grid>

          {/* Daily Driving */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Daily Driving
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontWeight="bold" color={getStatusColor(drivingStatus) + '.main'}>
                    {hosData.drivingHoursToday.toFixed(1)}/{maxDrivingDaily}h
                  </Typography>
                  {getStatusIcon(drivingStatus)}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(hosData.drivingHoursToday, maxDrivingDaily)}
                color={getStatusColor(drivingStatus)}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {hosData.drivingTimeRemaining.toFixed(1)}h remaining
              </Typography>
            </Box>
          </Grid>

          {/* Daily On-Duty */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Daily On-Duty
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontWeight="bold" color={getStatusColor(onDutyStatus) + '.main'}>
                    {hosData.onDutyHoursToday.toFixed(1)}/{maxOnDutyDaily}h
                  </Typography>
                  {getStatusIcon(onDutyStatus)}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(hosData.onDutyHoursToday, maxOnDutyDaily)}
                color={getStatusColor(onDutyStatus)}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {hosData.onDutyTimeRemaining.toFixed(1)}h remaining
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 30-minute break alert */}
        {needsBreak && (
          <Alert 
            icon={<Schedule />}
            severity="warning" 
            sx={{ mt: 1.5 }}
          >
            30-minute break required after {requiredBreakAfter} hours of driving
          </Alert>
        )}

        {/* Next required break */}
        {hosData.nextRequiredBreak && (
          <Alert 
            icon={<CalendarToday />}
            severity="info" 
            sx={{ mt: 1.5 }}
          >
            Next required break: {formatTime(hosData.nextRequiredBreak)}
          </Alert>
        )}

        {/* Last break info */}
        {hosData.lastBreakTime && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Last break: {formatTime(hosData.lastBreakTime)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceCard;