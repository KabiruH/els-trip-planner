// src/services/api.js
import axios from 'axios';

// Base configuration
const BASE_URL = 'https://els-trip-planner.onrender.com/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTHENTICATION SERVICES
// ===========================

export const authService = {
  // Register new driver
  register: async (userData) => {
    try {
      const response = await api.post('/drivers/register/', userData);
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.driver));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login driver
  login: async (credentials) => {
    try {
      const response = await api.post('/drivers/login/', credentials);
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.driver));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout driver
  logout: async () => {
    try {
      await api.post('/drivers/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get current user data from localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
};

// ===========================
// DRIVER SERVICES
// ===========================

export const driverService = {
  // Get current driver profile
  getProfile: async () => {
    const response = await api.get('/drivers/me/');
    return response.data;
  },

  // Update duty status
  updateDutyStatus: async (dutyData) => {
    const response = await api.patch('/drivers/update_duty_status/', dutyData);
    return response.data;
  },

  // Get driver statistics
  getStats: async () => {
    const response = await api.get('/drivers/stats/');
    return response.data;
  },

  // Get HOS compliance status
  getHOSStatus: async () => {
    const response = await api.get('/drivers/hos_status/');
    return response.data;
  },

  // Get recent trips
  getRecentTrips: async () => {
    const response = await api.get('/drivers/recent_trips/');
    return response.data;
  },
};

// ===========================
// TRIP SERVICES
// ===========================

export const tripService = {
  // Plan new HOS-compliant trip (MAIN ENDPOINT)
  planTrip: async (tripData) => {
    const response = await api.post('/trips/plan/', tripData);
    return response.data;
  },

  // Get all trips for current driver
  getTrips: async () => {
    const response = await api.get('/trips/');
    return response.data;
  },

  // Get specific trip details
  getTripById: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/`);
    return response.data;
  },

  // Update trip
  updateTrip: async (tripId, tripData) => {
    const response = await api.patch(`/trips/${tripId}/`, tripData);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (tripId) => {
    const response = await api.delete(`/trips/${tripId}/`);
    return response.data;
  },

  // Get all stops
  getStops: async () => {
    const response = await api.get('/trips/stops/');
    return response.data;
  },

  // Create stop
  createStop: async (stopData) => {
    const response = await api.post('/trips/stops/', stopData);
    return response.data;
  },

  // Update stop
  updateStop: async (stopId, stopData) => {
    const response = await api.patch(`/trips/stops/${stopId}/`, stopData);
    return response.data;
  },
};

// ===========================
// ELD LOGS SERVICES
// ===========================

export const eldLogsService = {
  // Daily logs
  getDailyLogs: async () => {
    const response = await api.get('/logs/daily/');
    return response.data;
  },

  // Get today's log
  getTodaysLog: async () => {
    const response = await api.get('/logs/daily/today/');
    return response.data;
  },

  // Get current week's logs
  getWeekLogs: async () => {
    const response = await api.get('/logs/daily/week/');
    return response.data;
  },

  // Get HOS summary (8 days)
  getHOSSummary: async () => {
    const response = await api.get('/logs/daily/hos_summary/');
    return response.data;
  },

  // Certify daily log
  certifyLog: async (logId) => {
    const response = await api.post(`/logs/daily/${logId}/certify/`);
    return response.data;
  },

  // Create daily log
  createDailyLog: async (logData) => {
    const response = await api.post('/logs/daily/', logData);
    return response.data;
  },

  // Log entries
  getLogEntries: async () => {
    const response = await api.get('/logs/entries/');
    return response.data;
  },

  // Get today's entries
  getTodaysEntries: async () => {
    const response = await api.get('/logs/entries/today/');
    return response.data;
  },

  // Add duty status change (MAIN ENDPOINT)
  addDutyChange: async (dutyData) => {
    const response = await api.post('/logs/entries/add_duty_change/', dutyData);
    return response.data;
  },

  // Create log entry
  createLogEntry: async (entryData) => {
    const response = await api.post('/logs/entries/', entryData);
    return response.data;
  },

  // Update log entry
  updateLogEntry: async (entryId, entryData) => {
    const response = await api.patch(`/logs/entries/${entryId}/`, entryData);
    return response.data;
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

export const apiUtils = {
  // Format API errors for display
  formatError: (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.detail) {
      return error.detail;
    }
    
    if (error.non_field_errors) {
      return error.non_field_errors.join(', ');
    }
    
    // Handle field-specific errors
    const fieldErrors = [];
    Object.keys(error).forEach(field => {
      if (Array.isArray(error[field])) {
        fieldErrors.push(`${field}: ${error[field].join(', ')}`);
      } else {
        fieldErrors.push(`${field}: ${error[field]}`);
      }
    });
    
    return fieldErrors.length > 0 ? fieldErrors.join('; ') : 'An error occurred';
  },

  // Get location data (for use with duty status changes)
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location', // You'd use a reverse geocoding service here
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },

  // Format date for API
  formatDate: (date) => {
    return new Date(date).toISOString();
  },

  // Parse API date
  parseDate: (dateString) => {
    return new Date(dateString);
  },
};

// ===========================
// CONSTANTS
// ===========================

export const API_CONSTANTS = {
  DUTY_STATUSES: {
    OFF_DUTY: 'off_duty',
    SLEEPER_BERTH: 'sleeper_berth',
    DRIVING: 'driving',
    ON_DUTY_NOT_DRIVING: 'on_duty_not_driving',
  },
  
  TRIP_STATUSES: {
    PLANNED: 'planned',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  
  STOP_TYPES: {
    PICKUP: 'pickup',
    DROPOFF: 'dropoff',
    FUEL: 'fuel',
    REST: 'rest',
    BREAK: 'break',
  },
  
  HOS_LIMITS: {
    MAX_DRIVING_HOURS: 11,
    MAX_ON_DUTY_HOURS: 14,
    MAX_CYCLE_HOURS: 70,
    MIN_OFF_DUTY_HOURS: 10,
  },
};

// Export the axios instance for custom requests
export { api };

// Default export with all services
export default {
  auth: authService,
  driver: driverService,
  trip: tripService,
  eldLogs: eldLogsService,
  utils: apiUtils,
  constants: API_CONSTANTS,
};