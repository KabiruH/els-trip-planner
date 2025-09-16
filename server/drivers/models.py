# drivers/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid

class DriverManager(BaseUserManager):
    """Custom manager for Driver model"""
    
    def create_user(self, email, employee_number, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not employee_number:
            raise ValueError('The Employee Number field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, employee_number=employee_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, employee_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, employee_number, password, **extra_fields)

class Driver(AbstractUser):
    """Simplified Driver model with just essentials"""
    
    # Remove username, use email instead
    username = None
    email = models.EmailField(unique=True, verbose_name="Email Address")
    
    # Essential driver fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_number = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Employee number"
    )
    
    # Current HOS status (useful for the ELD system)
    current_duty_status = models.CharField(
        max_length=20,
        choices=[
            ('off_duty', 'Off Duty'),
            ('sleeper_berth', 'Sleeper Berth'),
            ('driving', 'Driving'),
            ('on_duty_not_driving', 'On Duty (Not Driving)'),
        ],
        default='off_duty'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use custom manager
    objects = DriverManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['employee_number']
    
    class Meta:
        verbose_name = 'Driver'
        verbose_name_plural = 'Drivers'
    
    def __str__(self):
        return f"{self.email} ({self.employee_number})"