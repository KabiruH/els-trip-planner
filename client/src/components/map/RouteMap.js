import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import {
  LocalShipping,
  LocalGasStation,
  Hotel,
  MyLocation
} from '@mui/icons-material';

import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ tripData, onStopSelect }) => {
  const [selectedStop, setSelectedStop] = useState(null);
  const [error, setError] = useState(null);

  // Default trip data for demo
  const defaultTripData = {
    from: 'Green Bay, WI',
    fromCoords: [44.5133, -88.0133],
    to: 'Atlanta, GA',
    toCoords: [33.7490, -84.3880],
    distance: '716 miles',
    estimatedTime: '11h 30m',
    routeCoordinates: [
      [44.5133, -88.0133], // Green Bay, WI
      [43.0389, -87.9065], // Milwaukee, WI
      [41.8781, -87.6298], // Chicago, IL
      [40.7589, -86.1349], // Lafayette, IN
      [39.7817, -86.1478], // Indianapolis, IN
      [38.2727, -85.7585], // Louisville, KY
      [36.1627, -86.7816], // Nashville, TN
      [34.7465, -86.5897], // Huntsville, AL
      [33.7490, -84.3880]  // Atlanta, GA
    ],
    stops: [
      {
        id: 1,
        type: 'pickup',
        location: 'Green Bay, WI',
        address: '123 Industrial Dr, Green Bay, WI 54302',
        time: '08:00 AM',
        duration: '1h 00m',
        notes: 'Loading dock B-4, bring BOL',
        coordinates: [44.5133, -88.0133],
        status: 'planned'
      },
      {
        id: 2,
        type: 'fuel',
        location: 'Indianapolis, IN',
        address: 'Pilot Travel Center, I-65 Exit 103',
        time: '01:30 PM',
        duration: '30m',
        notes: 'Fuel + mandatory 30-min break',
        coordinates: [39.7817, -86.1478],
        status: 'planned'
      },
      {
        id: 3,
        type: 'rest',
        location: 'Nashville, TN',
        address: 'TA Travel Center, I-40 Exit 210',
        time: '06:00 PM',
        duration: '10h 00m',
        notes: 'Mandatory 10-hour rest period',
        coordinates: [36.1627, -86.7816],
        status: 'planned'
      },
      {
        id: 4,
        type: 'dropoff',
        location: 'Atlanta, GA',
        address: '789 Commerce Blvd, Atlanta, GA 30309',
        time: '08:00 AM (+1 day)',
        duration: '1h 00m',
        notes: 'Delivery appointment confirmed',
        coordinates: [33.7490, -84.3880],
        status: 'planned'
      }
    ]
  };

  const trip = tripData || defaultTripData;

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    if (onStopSelect) {
      onStopSelect(stop);
    }
  };

  const getStopIcon = (type) => {
    switch (type) {
      case 'pickup': return '📦';
      case 'dropoff': return '🏢';
      case 'fuel': return '⛽';
      case 'rest': return '🛏️';
      default: return '📍';
    }
  };

  const getStopColor = (type) => {
    switch (type) {
      case 'pickup': return '#1976d2';
      case 'dropoff': return '#2e7d32';
      case 'fuel': return '#ed6c02';
      case 'rest': return '#0288d1';
      default: return '#666';
    }
  };

  const calculateCenter = () => {
    if (trip.routeCoordinates && trip.routeCoordinates.length > 0) {
      const lats = trip.routeCoordinates.map(coord => coord[0]);
      const lngs = trip.routeCoordinates.map(coord => coord[1]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      return [centerLat, centerLng];
    }
    return [39.0, -88.0]; // Center of US as fallback
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  try {
    return (
      <Grid container spacing={3}>
        {/* Map Section */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 500 }}>
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              <div style={{ height: '500px', width: '100%' }}>
                <MapContainer
                  center={calculateCenter()}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Route Line */}
                  {trip.routeCoordinates && (
                    <Polyline
                      positions={trip.routeCoordinates}
                      color="#1976d2"
                      weight={4}
                      opacity={0.8}
                    />
                  )}

                  {/* Stop Markers */}
                  {trip.stops && trip.stops.map((stop) => (
                    <Marker
                      key={stop.id}
                      position={stop.coordinates}
                      eventHandlers={{
                        click: () => handleStopClick(stop)
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: '250px', padding: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '24px' }}>
                              {getStopIcon(stop.type)}
                            </span>
                            <div>
                              <strong style={{ fontSize: '16px' }}>{stop.location}</strong>
                              <div style={{ 
                                fontSize: '12px', 
                                color: getStopColor(stop.type),
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}>
                                {stop.status}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Address:</strong><br/>
                            {stop.address}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                            <div>
                              <strong>Time:</strong><br/>
                              {stop.time}
                            </div>
                            <div>
                              <strong>Duration:</strong><br/>
                              {stop.duration}
                            </div>
                          </div>
                          
                          {stop.notes && (
                            <div style={{ 
                              padding: '8px', 
                              backgroundColor: '#f5f5f5', 
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}>
                              <strong>Notes:</strong><br/>
                              {stop.notes}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Route Details Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box>
            {/* Trip Summary */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Route Overview
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">Distance:</Typography>
                  <Typography variant="body2" fontWeight="bold">{trip.distance}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">Est. Time:</Typography>
                  <Typography variant="body2" fontWeight="bold">{trip.estimatedTime}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total Stops:</Typography>
                  <Typography variant="body2" fontWeight="bold">{trip.stops?.length || 0}</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Stops List */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Planned Stops
                </Typography>
                <List dense>
                  {trip.stops && trip.stops.map((stop, index) => (
                    <ListItem
                      key={stop.id}
                      button
                      selected={selectedStop?.id === stop.id}
                      onClick={() => handleStopClick(stop)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.50',
                          borderLeft: 3,
                          borderLeftColor: getStopColor(stop.type)
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <span style={{ fontSize: '20px' }}>{getStopIcon(stop.type)}</span>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {stop.location}
                            </Typography>
                            <Chip
                              label={stop.type}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {stop.time} • {stop.duration}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stop.notes}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    );
  } catch (err) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Map failed to load: {err.message}
      </Alert>
    );
  }
};

export default RouteMap;