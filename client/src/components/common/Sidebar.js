import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  LocalShipping,
  Assignment,
  Assessment,
  Menu,
  Close,
  ExitToApp
} from '@mui/icons-material';

// Import API services
import { authService, driverService } from '../../services/api';

const Sidebar = ({ open, onClose, onOpen, user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(propUser);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Update user state when prop changes
  useEffect(() => {
    setUser(propUser);
  }, [propUser]);

  // Load additional user data if needed
  useEffect(() => {
    const loadUserData = async () => {
      if (propUser && (!propUser.first_name || !propUser.last_name)) {
        try {
          setLoading(true);
          const userData = await driverService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Don't navigate here, let parent handle it
        } finally {
          setLoading(false);
        }
      }
    };

    if (propUser) {
      loadUserData();
    }
  }, [propUser]);

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/dashboard',
      description: 'Overview and quick actions'
    },
    { 
      text: 'New Trip', 
      icon: <LocalShipping />, 
      path: '/new-trip',
      description: 'Plan a new delivery'
    },
    { 
      text: 'Trip History', 
      icon: <Assignment />, 
      path: '/trip-history',
      description: 'View past trips'
    },
    { 
      text: 'Trip Details', 
      icon: <Assessment />, 
      path: '/trip-details',
      description: 'Current trip information'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      
      // Call the parent logout handler
      await onLogout();
      
      // Close sidebar
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Loading...';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      return user.email;
    }
    
    return 'Driver';
  };

  const getUserId = () => {
    if (!user) return 'Loading...';
    return user.license_number || user.id || 'N/A';
  };

  const drawerWidth = 280;

  // Don't render sidebar if user is not authenticated
  if (!propUser?.isAuthenticated) {
    return null;
  }

  const sidebarContent = (
    <Box sx={{ width: drawerWidth, height: '100%', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: 'warning.main',
                width: 40,
                height: 40,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : getUserInitials()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                License: {getUserId()}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={onClose}
            sx={{ display: { sm: 'none' } }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* App Title */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          ELD Trip Planner
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Professional Electronic Logging
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'grey.100'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <Box>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 'bold' : 'medium'
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.7,
                      color: isActive ? 'white' : 'text.secondary'
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Driver Status */}
      {user && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Current Status
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {user.current_duty_status?.replace('_', ' ').toUpperCase() || 'OFF DUTY'}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Logout */}
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{
              borderRadius: 2,
              mx: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.50'
              },
              '&:disabled': {
                opacity: 0.7
              }
            }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              {loggingOut ? <CircularProgress size={20} color="error" /> : <ExitToApp />}
            </ListItemIcon>
            <ListItemText primary={loggingOut ? 'Logging out...' : 'Logout'} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2025 ELD Trip Planner
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { sm: 'none' },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onOpen}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            ELD Trip Planner
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;