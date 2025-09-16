# ELD Trip Planner

A comprehensive Electronic Logging Device (ELD) trip planning application that helps truck drivers plan routes while maintaining Hours of Service (HOS) compliance.

## 📋 Overview

The ELD Trip Planner is a full-stack web application designed to assist professional truck drivers with:
- Smart route planning with HOS compliance
- Electronic logging device functionality
- Trip history and management
- Real-time driver status tracking
- Professional driver dashboard

## 🏗️ Architecture

This application consists of two main components:

### Frontend (React Application)
- **Technology**: React 18 with Material-UI
- **Location**: `/frontend/` directory
- **Port**: 3000 (development)
- **Features**: Modern responsive UI with professional driver interface

### Backend (Django API)
- **Technology**: Django REST Framework
- **Location**: `/backend/` directory  
- **Port**: 8000 (development)
- **Features**: RESTful API with authentication and driver management

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eld-trip-planner
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📱 Features

### Driver Authentication
- Secure login/logout system
- Driver profile management
- Session management with JWT tokens

### Dashboard
- Real-time driver status
- Quick access to common actions
- Trip overview and statistics

### Trip Management
- Create new trips with route planning
- View trip history
- Track current trip details
- HOS compliance monitoring

### Professional Interface
- Clean, minimalist blue theme design
- Mobile-responsive layout
- Intuitive navigation with sidebar
- Professional electronic logging appearance

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
python manage.py runserver    # Start development server
python manage.py test         # Run tests
python manage.py migrate      # Apply database migrations
```

## 📁 Project Structure

```
eld-trip-planner/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── backend/                  # Django application
│   ├── apps/               # Django apps
│   ├── core/              # Project settings
│   ├── manage.py
│   └── requirements.txt
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:8000
```

**Backend (.env)**
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

## 📖 API Documentation

The backend provides a RESTful API with the following main endpoints:

- `/api/auth/` - Authentication endpoints
- `/api/drivers/` - Driver management
- `/api/trips/` - Trip management
- `/api/logs/` - ELD logging functionality

For detailed API documentation, visit http://localhost:8000/api/docs/ when running the backend.

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Backend Tests
```bash
cd backend
python manage.py test
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ directory to your hosting service
```

### Backend Deployment
```bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate
# Configure your WSGI server (gunicorn, uwsgi, etc.)
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in each component's README
