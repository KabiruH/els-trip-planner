import React from 'react';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const StopMarker = ({ stop, isSelected, onClick }) => {
  
  // Create custom icons for different stop types
  const createCustomIcon = (type, isSelected) => {
    const getIconConfig = (type) => {
      switch (type) {
        case 'pickup':
          return {
            color: '#1976d2',
            emoji: '📦',
            bgColor: isSelected ? '#1976d2' : '#e3f2fd'
          };
        case 'dropoff':
          return {
            color: '#2e7d32',
            emoji: '🏢',
            bgColor: isSelected ? '#2e7d32' : '#e8f5e8'
          };
        case 'fuel':
          return {
            color: '#ed6c02',
            emoji: '⛽',
            bgColor: isSelected ? '#ed6c02' : '#fff3e0'
          };
        case 'rest':
          return {
            color: '#0288d1',
            emoji: '🛏️',
            bgColor: isSelected ? '#0288d1' : '#e1f5fe'
          };
        default:
          return {
            color: '#666',
            emoji: '📍',
            bgColor: isSelected ? '#666' : '#f5f5f5'
          };
      }
    };

    const config = getIconConfig(type);
    
    // When react-leaflet is installed, uncomment this:

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background-color: ${config.bgColor};
          border: 3px solid ${config.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.2s ease;
        ">
          ${config.emoji}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
    
    return config;
  };

  const formatDuration = (duration) => {
    // Convert duration like "1h 00m" to more readable format
    return duration;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'current': return '#ff9800';
      case 'planned': return '#2196f3';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🚛';
      case 'planned': return '⏱️';
      default: return '📍';
    }
  };

  // Demo component (replace with actual Marker when react-leaflet is installed)
  const DemoMarker = () => {
    const config = createCustomIcon(stop.type, isSelected);
    
    return (
      <div style={{
        padding: '16px',
        margin: '8px 0',
        backgroundColor: 'white',
        border: `2px solid ${config.color}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
      }} onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: config.bgColor,
            border: `3px solid ${config.color}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            {config.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong style={{ fontSize: '16px' }}>{stop.location}</strong>
              <span style={{
                padding: '2px 6px',
                fontSize: '11px',
                backgroundColor: getStatusColor(stop.status),
                color: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                {getStatusIcon(stop.status)} {stop.status}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {stop.time} • {stop.duration}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // When react-leaflet is installed, replace DemoMarker with this:

  return (
    <Marker
      position={stop.coordinates}
      icon={createCustomIcon(stop.type, isSelected)}
      eventHandlers={{
        click: () => onClick(stop)
      }}
    >
      <Popup>
        <div style={{ minWidth: '250px', padding: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>
              {createCustomIcon(stop.type, false).emoji}
            </span>
            <div>
              <strong style={{ fontSize: '16px' }}>{stop.location}</strong>
              <div style={{ 
                fontSize: '12px', 
                color: getStatusColor(stop.status),
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
              {formatDuration(stop.duration)}
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
          
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '8px', 
            borderTop: '1px solid #e0e0e0',
            fontSize: '12px',
            color: '#666'
          }}>
            Stop {stop.id} • {stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
          </div>
        </div>
      </Popup>
    </Marker>
  );


  // Return demo component for now
  return <DemoMarker />;
};

export default StopMarker;