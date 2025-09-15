import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Paper,
  Container,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  Assessment,
  Schedule,
  CheckCircle
} from '@mui/icons-material';

// Import our Material-UI components from the components folder
import ComplianceCard from '../components/eld/ComplianceCard';
import { QuickTripButtons } from '../components/trip/QuickTripButton';
import TimelineView from '../components/eld/TimelineView';

const Dashboard = ({ driver = { name: 'John Smith', id: '001' } }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState({ temp: '72°F', condition: 'Sunny' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickTripSelect = (route) => {
    console.log('Selected route:', route);
    alert(`Planning trip: ${route.name}`);
  };

  const handleNewTrip = () => {
    console.log('Starting new trip');
    alert('Opening trip planning form...');
  };

  const handleViewHistory = () => {
    console.log('Viewing trip history');
    alert('Opening trip history...');
  };

  const handleViewReports = () => {
    console.log('Viewing reports');
    alert('Opening reports...');
  };

  const actionCards = [
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: 'Plan New Trip',
      description: 'Start planning your next delivery',
      onClick: handleNewTrip,
      color: 'primary'
    },
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      title: 'Trip History',
      description: 'View past deliveries and logs',
      onClick: handleViewHistory,
      color: 'secondary'
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Trip Details',
      description: 'View compliance and performance',
      onClick: handleViewReports,
      color: 'info'
    }
  ];

  const statusItems = [
    { value: '42.5h', label: 'Cycle Hours', icon: <Schedule /> },
    { value: '8.2h', label: "Today's Driving", icon: <LocalShipping /> },
    { value: 'Compliant', label: 'Status', icon: <CheckCircle color="success" /> },
    { value: '2h 15m', label: 'Time Until Break', icon: <Schedule /> }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {driver.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                Welcome back, {driver.name.split(' ')[0]}!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Driver ID: {driver.id} • Ready to roll
              </Typography>
            </Box>
          </Box>
          
          <Box textAlign="right">
            <Typography variant="h6" component="div">
              {currentTime.toLocaleTimeString()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {weatherData.temp} • {weatherData.condition}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Quick Status Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            {statusItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box display="flex" alignItems="center" gap={1}>
                  {item.icon}
                  <Box>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Action Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {actionCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'warning.main'
                  },
                  border: 2,
                  borderColor: 'transparent'
                }}
                onClick={card.onClick}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box color={`${card.color}.main`} mb={2}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <ComplianceCard 
              currentCycleHours={42.5}
              drivingHoursToday={8.2}
              onDutyHoursToday={9.5}
              lastBreakTime="11:30 AM"
              nextRequiredBreak="2:15 PM"
            />
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <QuickTripButtons onQuickTripSelect={handleQuickTripSelect} />
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <TimelineView />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;