# utils/constants.py
from django.conf import settings

# HOS Duty Status Choices
DUTY_STATUS_CHOICES = [
    ('off_duty', 'Off Duty'),
    ('sleeper_berth', 'Sleeper Berth'),
    ('driving', 'Driving'),
    ('on_duty_not_driving', 'On Duty (Not Driving)'),
]

# HOS Regulations (from settings)
HOS_MAX_CYCLE_HOURS = getattr(settings, 'HOS_REGULATIONS', {}).get('MAX_CYCLE_HOURS', 70)
HOS_CYCLE_PERIOD_DAYS = getattr(settings, 'HOS_REGULATIONS', {}).get('CYCLE_PERIOD_DAYS', 8)
HOS_MAX_DRIVING_HOURS = getattr(settings, 'HOS_REGULATIONS', {}).get('MAX_DRIVING_HOURS', 11)
HOS_MAX_ON_DUTY_HOURS = getattr(settings, 'HOS_REGULATIONS', {}).get('MAX_ON_DUTY_HOURS', 14)
HOS_MIN_OFF_DUTY_HOURS = getattr(settings, 'HOS_REGULATIONS', {}).get('MIN_OFF_DUTY_HOURS', 10)
HOS_FUEL_INTERVAL_MILES = getattr(settings, 'HOS_REGULATIONS', {}).get('FUEL_INTERVAL_MILES', 1000)
HOS_PICKUP_DROPOFF_DURATION = getattr(settings, 'HOS_REGULATIONS', {}).get('PICKUP_DROPOFF_DURATION', 1)

# Trip Status Choices
TRIP_STATUS_CHOICES = [
    ('planned', 'Planned'),
    ('active', 'Active'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]

# Stop Type Choices
STOP_TYPE_CHOICES = [
    ('pickup', 'Pickup'),
    ('dropoff', 'Dropoff'),
    ('fuel', 'Fuel Stop'),
    ('rest', 'Mandatory Rest'),
    ('break', 'Break'),
    ('meal', 'Meal Break'),
]

# Log Entry Event Types
LOG_EVENT_TYPES = [
    ('duty_status_change', 'Duty Status Change'),
    ('vehicle_inspection', 'Vehicle Inspection'),
    ('fuel_purchase', 'Fuel Purchase'),
    ('border_crossing', 'Border Crossing'),
    ('malfunction', 'ELD Malfunction'),
]

# Map Colors for Different Duty Statuses (for frontend)
DUTY_STATUS_COLORS = {
    'off_duty': '#808080',  # Gray
    'sleeper_berth': '#0000FF',  # Blue
    'driving': '#008000',  # Green
    'on_duty_not_driving': '#FF0000',  # Red
}

# Default durations for different stop types (in minutes)
DEFAULT_STOP_DURATIONS = {
    'pickup': 60,  # 1 hour
    'dropoff': 60,  # 1 hour
    'fuel': 30,    # 30 minutes
    'rest': 600,   # 10 hours (minimum off-duty)
    'break': 30,   # 30 minutes
    'meal': 30,    # 30 minutes
}

# OpenRouteService API Configuration
ORS_PROFILE_DRIVING_HGV = 'driving-hgv'  # Heavy goods vehicle profile
ORS_MAX_DISTANCE_MATRIX = 50  # Maximum locations for distance matrix

# Error Messages
ERROR_MESSAGES = {
    'HOS_VIOLATION_DRIVING': f'Cannot drive more than {HOS_MAX_DRIVING_HOURS} hours per day',
    'HOS_VIOLATION_ON_DUTY': f'Cannot be on duty more than {HOS_MAX_ON_DUTY_HOURS} hours per day',
    'HOS_VIOLATION_CYCLE': f'Cannot exceed {HOS_MAX_CYCLE_HOURS} hours in {HOS_CYCLE_PERIOD_DAYS} days',
    'INSUFFICIENT_REST': f'Must have at least {HOS_MIN_OFF_DUTY_HOURS} hours off duty',
    'INVALID_LOCATION': 'Invalid location coordinates provided',
    'ROUTE_CALCULATION_FAILED': 'Failed to calculate route',
    'FUEL_STOP_REQUIRED': f'Fuel stop required - maximum distance between fuel stops is {HOS_FUEL_INTERVAL_MILES} miles',
}

# Success Messages
SUCCESS_MESSAGES = {
    'TRIP_PLANNED': 'Trip planned successfully with HOS compliance',
    'LOG_GENERATED': 'ELD log sheet generated successfully',
    'DUTY_STATUS_UPDATED': 'Duty status updated successfully',
    'TRIP_COMPLETED': 'Trip completed successfully',
}

# API Rate Limits
API_RATE_LIMITS = {
    'ROUTE_CALCULATION': 100,  # per hour
    'LOG_GENERATION': 50,      # per hour
}

# File Upload Settings
MAX_LOG_SHEET_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_FORMATS = ['JPEG', 'PNG', 'PDF']

# utils/exceptions.py
class HOSViolationError(Exception):
    """Raised when an action would violate HOS regulations"""
    pass

class RouteCalculationError(Exception):
    """Raised when route calculation fails"""
    pass

class InvalidLocationError(Exception):
    """Raised when provided location is invalid"""
    pass

class ELDLogError(Exception):
    """Raised when ELD log generation fails"""
    pass

# utils/validators.py
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re

def validate_coordinates(lat, lng):
    """Validate latitude and longitude coordinates"""
    try:
        lat = float(lat)
        lng = float(lng)
        if not (-90 <= lat <= 90):
            raise ValidationError('Latitude must be between -90 and 90')
        if not (-180 <= lng <= 180):
            raise ValidationError('Longitude must be between -180 and 180')
        return True
    except (ValueError, TypeError):
        raise ValidationError('Invalid coordinate format')

def validate_phone_number():
    """Phone number validator"""
    return RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.'
    )

def validate_license_number():
    """License number validator"""
    return RegexValidator(
        regex=r'^[A-Z0-9]{8,20}$',
        message='License number must be 8-20 alphanumeric characters'
    )

def validate_employee_id():
    """Employee ID validator"""
    return RegexValidator(
        regex=r'^[A-Z0-9]{3,10}$',
        message='Employee ID must be 3-10 alphanumeric characters'
    )