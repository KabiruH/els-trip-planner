import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Stack
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  TrendingUp,
  Route,
  Speed
} from '@mui/icons-material';

// Import API services
import { driverService, eldLogsService, apiUtils } from '../services/api';

// Import components
import ComplianceCard from '../components/eld/ComplianceCard';
import { QuickTripButtons } from '../components/trip/QuickTripButton';
import TimelineView from '../components/eld/TimelineView';

const Dashboard = ({ driver }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [driverStats, setDriverStats] = useState(null);
  const [hosStatus, setHosStatus] = useState(null);
  const [todaysLog, setTodaysLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, hosResponse, logResponse] = await Promise.all([
          driverService.getStats(),
          driverService.getHOSStatus().catch(() => null), // Handle HOS error gracefully
          eldLogsService.getTodaysLog()
        ]);

        setDriverStats(statsResponse);
        setHosStatus(hosResponse);
        setTodaysLog(logResponse);

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(apiUtils.formatError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickTripSelect = (route) => {
    navigate('/new-trip', { state: { quickRoute: route } });
  };

  // Get compliance status
  const getComplianceStatus = () => {
    if (!hosStatus) return { icon: <Schedule />, color: 'warning', text: 'Loading...', bgColor: 'warning.50' };
    
    if (hosStatus.violations && hosStatus.violations.length > 0) {
      return { icon: <Error />, color: 'error', text: 'Violation', bgColor: 'error.50' };
    }
    if (!hosStatus.can_drive) {
      return { icon: <Warning />, color: 'warning', text: 'Cannot Drive', bgColor: 'warning.50' };
    }
    return { icon: <CheckCircle />, color: 'success', text: 'Compliant', bgColor: 'success.50' };
  };

  const complianceStatus = getComplianceStatus();

  // Modern metric cards data
  const metricCards = [
    {
      title: 'Cycle Hours',
      value: hosStatus ? `${parseFloat(hosStatus.current_cycle_hours || 0).toFixed(1)}` : '0.0',
      unit: '/ 70h',
      icon: <Schedule sx={{ fontSize: 32 }} />,
      color: hosStatus?.current_cycle_hours >= 60 ? 'warning' : 'primary',
      progress: hosStatus ? (parseFloat(hosStatus.current_cycle_hours || 0) / 70) * 100 : 0
    },
    {
      title: "Today's Driving",
      value: todaysLog ? `${parseFloat(todaysLog.total_driving_time || 0).toFixed(1)}` : '0.0',
      unit: '/ 11h',
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      color: todaysLog?.total_driving_time >= 10 ? 'warning' : 'info',
      progress: todaysLog ? (parseFloat(todaysLog.total_driving_time || 0) / 11) * 100 : 0
    },
    {
      title: 'Total Trips',
      value: driverStats?.total_trips || '0',
      unit: 'completed',
      icon: <Route sx={{ fontSize: 32 }} />,
      color: 'success',
      progress: null
    },
    {
      title: 'HOS Status',
      value: complianceStatus.text,
      unit: '',
      icon: complianceStatus.icon,
      color: complianceStatus.color,
      progress: null,
      isStatus: true
    }
  ];

  // Quick action buttons
  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Start planning your next delivery',
      icon: <LocalShipping sx={{ fontSize: 24 }} />,
      onClick: () => navigate('/new-trip'),
      color: 'primary',
      featured: true
    },
    {
      title: 'Trip History',
      description: 'View past deliveries',
      icon: <Assignment sx={{ fontSize: 24 }} />,
      onClick: () => navigate('/trip-history'),
      color: 'secondary'
    },
    {
      title: 'Trip Details',
      description: 'Current trip info',
      icon: <Assessment sx={{ fontSize: 24 }} />,
      onClick: () => navigate('/trip-details'),
      color: 'info'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'grey.50'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Typography variant="h6">Failed to load dashboard</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: 'grey.50', 
      minHeight: '100vh',
      pt: 3,
      pb: 4
    }}>
      {/* Top Header with Time */}
      <Box sx={{ 
        px: 3, 
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
        
        <Box sx={{ 
          textAlign: 'right',
          bgcolor: 'white',
          px: 3,
          py: 1.5,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Current Time
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        {/* HOS Violations Alert */}
        {hosStatus?.violations && hosStatus.violations.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}
          >
            <Typography variant="h6" gutterBottom>HOS Violations Detected</Typography>
            {hosStatus.violations.map((violation, index) => (
              <Typography key={index}>• {violation}</Typography>
            ))}
          </Alert>
        )}

        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metricCards.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.title}
                      </Typography>
                      <Box display="flex" alignItems="baseline" gap={0.5}>
                        <Typography variant="h4" fontWeight="bold" color={`${metric.color}.main`}>
                          {metric.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metric.unit}
                        </Typography>
                      </Box>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${metric.color}.50`,
                        color: `${metric.color}.main`
                      }}
                    >
                      {metric.icon}
                    </Box>
                  </Box>
                  
                  {metric.progress !== null && (
                    <Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 6, 
                        bgcolor: 'grey.200', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${Math.min(metric.progress, 100)}%`, 
                          height: '100%', 
                          bgcolor: `${metric.color}.main`,
                          borderRadius: 3,
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {metric.progress.toFixed(1)}% of limit
                      </Typography>
                    </Box>
                  )}
                  
                  {metric.isStatus && (
                    <Chip 
                      label={metric.value}
                      color={metric.color}
                      size="small"
                      icon={metric.icon}
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'grey.100'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    fullWidth
                    variant={action.featured ? 'contained' : 'outlined'}
                    color={action.color}
                    startIcon={action.icon}
                    onClick={action.onClick}
                    sx={{ 
                      py: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: action.featured ? 4 : 2
                      }
                    }}
                  >
                    <Box textAlign="left" ml={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {action.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {action.description}
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} xl={4}>
            <ComplianceCard />
          </Grid>
          
          <Grid item xs={12} xl={4}>
            <QuickTripButtons onQuickTripSelect={handleQuickTripSelect} />
          </Grid>
          
          <Grid item xs={12} xl={4}>
            <TimelineView />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;