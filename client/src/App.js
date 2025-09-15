import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import './App.css';
import 'leaflet/dist/leaflet.css';

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
  const [user, setUser] = useState({ name: 'John Smith', id: '001' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const drawerWidth = 280;

  return (
    <div className="App">
      <Layout>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Sidebar 
              open={sidebarOpen} 
              onClose={() => setSidebarOpen(false)}
              onOpen={() => setSidebarOpen(true)}
              user={user}
            />
            
            {/* Main content area */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                mt: { xs: 8, sm: 0 }, // Add top margin on mobile for AppBar
              }}
            >
              <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/dashboard" element={<Dashboard driver={user} />} />
                <Route path="/new-trip" element={<NewTrip driver={user} />} />
                <Route path="/trip-history" element={<TripHistory driver={user} />} />
                <Route path="/trip-details" element={<TripDetails driver={user} />} />
                <Route path="/" element={<Dashboard driver={user} />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </Layout>
    </div>
  );
}

export default App;