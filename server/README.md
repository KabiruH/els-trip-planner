# ELD Trip Planner - Backend

A Django REST Framework API providing Electronic Logging Device functionality and driver management for the ELD Trip Planner application.

## 🛠️ Technology Stack

- **Django 4.2** - Modern Python web framework
- **Django REST Framework** - Powerful REST API toolkit
- **PostgreSQL** - Production database (SQLite for development)
- **JWT Authentication** - JSON Web Token authentication
- **CORS Headers** - Cross-Origin Resource Sharing support
- **Celery** - Asynchronous task processing (optional)

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip package manager
- PostgreSQL (for production)
- Redis (for Celery, optional)

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DEBUG=True
   SECRET_KEY=your-super-secret-key-here
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   JWT_SECRET_KEY=your-jwt-secret-key
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the API**
   - API Root: http://localhost:8000/api/
   - Admin Panel: http://localhost:8000/admin/

## 📡 API Endpoints

### Authentication Endpoints
```
POST /api/auth/login/           # Driver login
POST /api/auth/logout/          # Driver logout
POST /api/auth/refresh/         # Refresh JWT token
POST /api/auth/register/        # Driver registration
GET  /api/auth/profile/         # Get current driver profile
PUT  /api/auth/profile/         # Update driver profile
```

### Driver Management
```
GET    /api/drivers/            # List drivers (admin only)
GET    /api/drivers/{id}/       # Get driver details
PUT    /api/drivers/{id}/       # Update driver
DELETE /api/drivers/{id}/       # Delete driver (admin only)
GET    /api/drivers/me/         # Get current driver profile
PUT    /api/drivers/me/         # Update current driver profile
```

### Trip Management
```
GET    /api/trips/              # List driver's trips
POST   /api/trips/              # Create new trip
GET    /api/trips/{id}/         # Get trip details
PUT    /api/trips/{id}/         # Update trip
DELETE /api/trips/{id}/         # Delete trip
POST   /api/trips/{id}/start/   # Start trip
POST   /api/trips/{id}/end/     # End trip
```

### ELD Logging
```
GET    /api/logs/               # List driver's logs
POST   /api/logs/               # Create new log entry
GET    /api/logs/{id}/          # Get log details
PUT    /api/logs/{id}/          # Update log entry
GET    /api/logs/current/       # Get current duty status
POST   /api/logs/duty-status/   # Change duty status
```

### HOS (Hours of Service)
```
GET    /api/hos/summary/        # Get HOS summary
GET    /api/hos/violations/     # Get HOS violations
GET    /api/hos/remaining/      # Get remaining drive time
```

## 🗃️ Database Models

### Driver Model
```python
class Driver(AbstractUser):
    license_number = models.CharField(max_length=20, unique=True)
    license_expiry = models.DateField()
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    current_duty_status = models.CharField(max_length=20)
    vehicle_number = models.CharField(max_length=20)
    carrier_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Trip Model
```python
class Trip(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    status = models.CharField(max_length=20)
    planned_start_time = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True)
    planned_end_time = models.DateTimeField()
    actual_end_time = models.DateTimeField(null=True)
    total_distance = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Log Entry Model
```python
class LogEntry(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    duty_status = models.CharField(max_length=20)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True)
    location = models.CharField(max_length=255)
    vehicle_miles = models.IntegerField()
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

## 🔐 Authentication

### JWT Token Authentication
- **Access Token**: Short-lived token for API requests (15 minutes)
- **Refresh Token**: Long-lived token for getting new access tokens (7 days)
- **Token Rotation**: Automatic token refresh on expiry

### Authentication Flow
1. Driver sends credentials to `/api/auth/login/`
2. Backend validates credentials
3. Backend returns access and refresh tokens
4. Frontend stores tokens securely
5. Frontend includes access token in Authorization header
6. Backend validates token on each request

### Permissions
- **IsAuthenticated**: Requires valid JWT token
- **IsOwner**: Can only access own data
- **IsAdminUser**: Admin-only endpoints

## 🛡️ Security Features

### Data Protection
- **Password Hashing**: Django's built-in PBKDF2 hashing
- **JWT Secrets**: Secure token signing
- **CORS Configuration**: Restricted cross-origin requests
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Django ORM protection

### API Security
- **Rate Limiting**: API request rate limiting
- **Authentication Required**: Protected endpoints
- **Permission Checks**: Role-based access control
- **Input Validation**: Serializer validation
- **Error Handling**: Secure error responses

## 📊 API Documentation

### Swagger/OpenAPI
Access interactive API documentation at:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Postman Collection
Import the Postman collection for easy API testing:
```bash
# Export collection (if available)
python manage.py export_postman_collection
```

## 🚀 Deployment

### Environment Setup

#### Development
```env
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Production
```env
DEBUG=False
DATABASE_URL=postgres://user:pass@localhost/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECRET_KEY=production-secret-key

## 🔧 Configuration

### Django Settings
```python
# core/settings/base.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'apps.authentication',
    'apps.drivers',
    'apps.trips',
    'apps.logs',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Celery Configuration (Optional)
```python
# core/celery.py
from celery import Celery

app = Celery('eld_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

## 🐛 Debugging

### Common Issues

#### Database Connection
```bash
# Check database connection
python manage.py dbshell
```

#### Migration Issues
```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial
```

#### CORS Issues
```python
# Check CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]


## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Write tests for new functionality
3. Implement feature
4. Ensure all tests pass
5. Update documentation
6. Submit pull request
