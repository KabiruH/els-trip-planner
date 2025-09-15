import React from 'react';
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
  Toolbar
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

const Sidebar = ({ open, onClose, onOpen, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
      description: 'Details of specific trips'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    navigate('/login');
    onClose();
  };

  const drawerWidth = 280;

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
              {user?.name?.split(' ').map(n => n[0]).join('') || 'JS'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.name || 'John Smith'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Driver ID: {user?.id || '001'}
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

      {/* Logout */}
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mx: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.50'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2025 ELD Trip Planner
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