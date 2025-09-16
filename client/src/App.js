import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import './App.css';
import 'leaflet/dist/leaflet.css';

// Import API services
import { authService } from './services/api';

// Import common components
import Layout from './components/common/Layout';
import Sidebar from './components/common/Sidebar';

// Import pages
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import TripDetails from './pages/TripDetails';
import TripHistory from './pages/TripHistory';

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getCurrentUser();
        if (userData) {
          setUser({
            ...userData,
            isAuthenticated: true
          });
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSidebarOpen(false);
      // Don't navigate here - let the component re-render handle it
    }
  };

  const drawerWidth = 280;

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="App">
        <Layout>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '100vh' 
            }}
          >
            <div>Loading...</div>
          </Box>
        </Layout>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return user?.isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Public Route Component (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    return user?.isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
  };

  return (
    <div className="App">
      <Layout>
        <Router>
          <Box sx={{ display: 'flex' }}>
            {/* Only show sidebar if user is authenticated */}
            {user?.isAuthenticated && (
              <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onOpen={() => setSidebarOpen(true)}
                user={user}
                onLogout={handleLogout}
              />
            )}
           
            {/* Main content area */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                // Only apply sidebar spacing if user is authenticated
                width: user?.isAuthenticated 
                  ? { sm: `calc(100% - ${drawerWidth}px)` }
                  : '100%',
                mt: { xs: 8, sm: 0 }, // Add top margin on mobile for AppBar
              }}
            >
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage onLogin={handleLogin} />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard driver={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/new-trip" 
                  element={
                    <ProtectedRoute>
                      <NewTrip driver={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trip-history" 
                  element={
                    <ProtectedRoute>
                      <TripHistory driver={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trip-details" 
                  element={
                    <ProtectedRoute>
                      <TripDetails driver={user} />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Default Route */}
                <Route 
                  path="/" 
                  element={
                    user?.isAuthenticated 
                      ? <Navigate to="/dashboard" replace /> 
                      : <Navigate to="/login" replace />
                  } 
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </Layout>
    </div>
  );
}

export default App;