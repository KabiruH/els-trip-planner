# ELD Trip Planner - Frontend

A modern React application providing a professional Electronic Logging Device interface for truck drivers.

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks and functional components
- **Material-UI (MUI) 5** - Professional component library
- **React Router 6** - Client-side routing
- **Leaflet** - Interactive maps for route planning
- **Axios** - HTTP client for API communication

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   │   └── LoginForm.js
│   └── common/          # Shared components
│       ├── Layout.js
│       └── Sidebar.js
├── pages/               # Page components
│   ├── Login.js         # Login page
│   ├── Dashboard.js     # Main dashboard
│   ├── NewTrip.js       # Trip creation
│   ├── TripDetails.js   # Trip details view
│   └── TripHistory.js   # Trip history
├── services/            # API services
│   └── api.js          # API client and services
├── App.js              # Main application component
├── App.css             # Global styles
└── index.js            # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_API_VERSION=v1
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to http://localhost:3000

## 📱 Features

### Authentication System
- **Secure Login**: JWT-based authentication
- **Session Management**: Automatic token handling
- **Protected Routes**: Route guards for authenticated pages
- **Logout Functionality**: Clean session termination

### Professional UI Design
- **Minimalist Blue Theme**: Professional, clean interface
- **Full-page Layout**: Modern, immersive design
- **Material-UI Components**: Consistent, accessible UI
- **Responsive Design**: Works on desktop and mobile
- **Glassmorphism Effects**: Modern visual styling

### Navigation
- **Sidebar Navigation**: Professional driver interface
- **Route-based Navigation**: Clean URL structure
- **Mobile-friendly**: Collapsible sidebar for mobile
- **Active State Indicators**: Clear navigation feedback

### Driver Dashboard
- **Real-time Status**: Current duty status display
- **Quick Actions**: Easy access to common tasks
- **Trip Overview**: Current and recent trip information
- **Professional Layout**: Clean, organized interface

### Trip Management
- **Trip Planning**: Interactive route planning
- **Trip History**: View past trips and logs
- **Trip Details**: Detailed trip information
- **HOS Compliance**: Hours of Service tracking


## 🔧 Configuration

### Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_VERSION=v1

# Feature Flags
REACT_APP_ENABLE_MAPS=true
REACT_APP_DEBUG_MODE=false
```

### Build Configuration

The application uses Create React App with default configuration. Custom webpack configuration can be added using CRACO if needed.

## 📡 API Integration

### Service Architecture
```javascript
// services/api.js structure
export const authService = {
  login,
  logout,
  isAuthenticated,
  getCurrentUser
};

export const driverService = {
  getProfile,
  updateProfile
};

export const tripService = {
  createTrip,
  getTrips,
  getTripDetails
};
```

### Authentication Flow
1. User enters credentials on login page
2. Frontend sends request to Django backend
3. Backend returns JWT token and user data
4. Frontend stores token and redirects to dashboard
5. All subsequent requests include JWT token

### Error Handling
- Global error boundary for React errors
- API error formatting and user-friendly messages
- Network error handling with retry logic
- Form validation with real-time feedback

## 📦 Build and Deployment

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Build Optimization
- Code splitting for optimal loading
- Asset optimization and compression
- Bundle analysis with webpack-bundle-analyzer
- Progressive Web App features

### Deployment Options
- **Netlify**: Automatic deployment from Git
- **Vercel**: Serverless deployment
- **AWS S3 + CloudFront**: Static hosting
- **Docker**: Containerized deployment

## 🔍 Performance

### Optimization Features
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large lists (if needed)

### Bundle Analysis
```bash
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## 🐛 Debugging

### Development Tools
- React Developer Tools browser extension
- Redux DevTools (if Redux is added)
- Browser debugger with source maps
- Console logging with debug levels

### Common Issues
- **CORS Errors**: Ensure backend allows frontend origin
- **Token Expiry**: Check token refresh logic
- **Route Issues**: Verify React Router configuration
- **API Errors**: Check network tab for API responses

## 🔒 Security

### Security Measures
- **JWT Token Storage**: Secure token handling
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: API token-based protection
- **Route Protection**: Authentication guards
- **Input Validation**: Client-side validation

## 📱 Mobile Support

### Responsive Features
- **Mobile-first Design**: Optimized for mobile devices
- **Touch Interactions**: Mobile-friendly controls
- **Sidebar Collapse**: Drawer navigation for mobile
- **Viewport Optimization**: Proper mobile viewport handling

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **Component Naming**: PascalCase for components

## 📄 Dependencies

### Core Dependencies
```json
{
  "react": "^18.0.0",
  "@mui/material": "^5.0.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0",
  "leaflet": "^1.9.0"
}
```

### Development Dependencies
```json
{
  "@testing-library/react": "^13.0.0",
  "eslint": "^8.0.0",
  "prettier": "^2.0.0"
}
```
