# eld_logs/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from decimal import Decimal
import uuid

class DailyLog(models.Model):
    """Daily log sheet for a driver"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_logs'
    )
    trip = models.ForeignKey(
        'trips.Trip',
        on_delete=models.CASCADE,
        related_name='daily_logs',
        null=True,
        blank=True
    )
    
    # Log date
    log_date = models.DateField()
    
    # Daily totals (in hours)
    total_driving_time = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(11)]
    )
    total_on_duty_time = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(14)]
    )
    total_off_duty_time = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_sleeper_berth_time = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Vehicle information
    vehicle_id = models.CharField(max_length=50, blank=True)
    odometer_start = models.PositiveIntegerField(null=True, blank=True)
    odometer_end = models.PositiveIntegerField(null=True, blank=True)
    
    # Location information
    starting_location = models.JSONField(
        null=True,
        blank=True,
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    ending_location = models.JSONField(
        null=True,
        blank=True,
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    
    # Compliance flags
    is_hos_compliant = models.BooleanField(default=True)
    hos_violations = models.JSONField(
        null=True,
        blank=True,
        help_text="List of HOS violations if any"
    )
    
    # Driver certification
    is_certified = models.BooleanField(default=False)
    certification_datetime = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['driver', 'log_date']
        ordering = ['-log_date']
        verbose_name = 'Daily Log'
        verbose_name_plural = 'Daily Logs'
    
    def __str__(self):
        return f"{self.driver.email} - {self.log_date}"
    
    @property
    def total_miles(self):
        """Calculate total miles driven"""
        if self.odometer_start and self.odometer_end:
            return self.odometer_end - self.odometer_start
        return 0


class LogEntry(models.Model):
    """Individual duty status change entries within a daily log"""
    
    DUTY_STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty_not_driving', 'On Duty (Not Driving)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    daily_log = models.ForeignKey(
        DailyLog,
        on_delete=models.CASCADE,
        related_name='log_entries'
    )
    
    # Duty status change
    duty_status = models.CharField(max_length=20, choices=DUTY_STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Duration in minutes
    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Duration in minutes"
    )
    
    # Location information
    location = models.JSONField(
        null=True,
        blank=True,
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    
    # Additional information
    remarks = models.TextField(blank=True)
    odometer_reading = models.PositiveIntegerField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_time']
        verbose_name = 'Log Entry'
        verbose_name_plural = 'Log Entries'
    
    def __str__(self):
        return f"{self.get_duty_status_display()} - {self.start_time}"
    
    @property
    def duration_hours(self):
        """Duration in hours"""
        if self.duration_minutes:
            return self.duration_minutes / 60
        return 0