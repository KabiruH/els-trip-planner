import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Assessment,
  Warning,
  CheckCircle,
  Cancel,
  Schedule,
  CalendarToday
} from '@mui/icons-material';

const ComplianceCard = ({ 
  currentCycleHours = 0, 
  drivingHoursToday = 0, 
  onDutyHoursToday = 0, 
  lastBreakTime = null,
  nextRequiredBreak = null 
}) => {
  // HOS Rules (70-hour/8-day cycle)
  const maxCycleHours = 70;
  const maxDrivingDaily = 11;
  const maxOnDutyDaily = 14;
  const requiredBreakAfter = 8; // hours of driving

  // Calculate compliance status
  const cycleStatus = currentCycleHours >= maxCycleHours ? 'violation' : 
                     currentCycleHours >= maxCycleHours * 0.9 ? 'warning' : 'good';
  
  const drivingStatus = drivingHoursToday >= maxDrivingDaily ? 'violation' : 
                       drivingHoursToday >= maxDrivingDaily * 0.9 ? 'warning' : 'good';
  
  const onDutyStatus = onDutyHoursToday >= maxOnDutyDaily ? 'violation' : 
                      onDutyHoursToday >= maxOnDutyDaily * 0.9 ? 'warning' : 'good';

  const needsBreak = drivingHoursToday >= requiredBreakAfter && !lastBreakTime;

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

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2} pb={1.5} borderBottom={1} borderColor="grey.200">
          <Assessment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h3">
            HOS Compliance Status
          </Typography>
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
                    {currentCycleHours}/{maxCycleHours}h
                  </Typography>
                  {getStatusIcon(cycleStatus)}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(currentCycleHours, maxCycleHours)}
                color={getStatusColor(cycleStatus)}
                sx={{ height: 8, borderRadius: 1 }}
              />
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
                    {drivingHoursToday}/{maxDrivingDaily}h
                  </Typography>
                  {getStatusIcon(drivingStatus)}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(drivingHoursToday, maxDrivingDaily)}
                color={getStatusColor(drivingStatus)}
                sx={{ height: 8, borderRadius: 1 }}
              />
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
                    {onDutyHoursToday}/{maxOnDutyDaily}h
                  </Typography>
                  {getStatusIcon(onDutyStatus)}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(onDutyHoursToday, maxOnDutyDaily)}
                color={getStatusColor(onDutyStatus)}
                sx={{ height: 8, borderRadius: 1 }}
              />
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
        {nextRequiredBreak && (
          <Alert 
            icon={<CalendarToday />}
            severity="info" 
            sx={{ mt: 1.5 }}
          >
            Next required break: {nextRequiredBreak}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceCard;