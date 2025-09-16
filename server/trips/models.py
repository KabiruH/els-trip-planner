# trips/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from decimal import Decimal
import uuid

class Trip(models.Model):
    """Main trip model for ELD trip planning"""
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='trips'
    )
    
    # Trip locations (stored as JSON with lat, lng, address)
    current_location = models.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    pickup_location = models.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    dropoff_location = models.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    
    # HOS information
    current_cycle_hours = models.DecimalField(
        max_digits=4, 
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        help_text="Current hours used in 8-day cycle"
    )
    
    # Trip metrics (calculated by route planning)
    total_distance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Total distance in miles"
    )
    estimated_duration = models.DurationField(
        null=True, 
        blank=True,
        help_text="Estimated total trip duration"
    )
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    planned_start_time = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    estimated_end_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    
    # Route data from mapping service
    route_geometry = models.JSONField(
        null=True, 
        blank=True, 
        help_text="GeoJSON route geometry from mapping service"
    )
    
    # HOS compliance
    is_hos_compliant = models.BooleanField(default=True)
    hos_violations = models.JSONField(
        null=True, 
        blank=True,
        help_text="List of HOS violations if any"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
    
    def __str__(self):
        return f"Trip {str(self.id)[:8]} - {self.driver.email}"


class Stop(models.Model):
    """Stops along the trip route (fuel, rest, pickup, dropoff)"""
    
    STOP_TYPES = [
        ('pickup', 'Pickup'),
        ('dropoff', 'Dropoff'),
        ('fuel', 'Fuel Stop'),
        ('rest', 'Mandatory Rest'),
        ('break', 'Break'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    
    # Stop details
    stop_type = models.CharField(max_length=20, choices=STOP_TYPES)
    location = models.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str, 'name': str}"
    )
    
    # Timing
    planned_arrival_time = models.DateTimeField()
    planned_departure_time = models.DateTimeField()
    actual_arrival_time = models.DateTimeField(null=True, blank=True)
    actual_departure_time = models.DateTimeField(null=True, blank=True)
    
    # Stop metrics
    duration_minutes = models.PositiveIntegerField(
        help_text="Planned duration in minutes"
    )
    distance_from_previous = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        help_text="Distance from previous stop in miles",
        default=Decimal('0.00')
    )
    
    # Stop-specific information
    is_mandatory = models.BooleanField(
        default=False,
        help_text="True for HOS-required stops"
    )
    notes = models.TextField(blank=True)
    
    # Order in the trip
    sequence = models.PositiveIntegerField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sequence']
        unique_together = ['trip', 'sequence']
        verbose_name = 'Stop'
        verbose_name_plural = 'Stops'
    
    def __str__(self):
        return f"{self.get_stop_type_display()} - {self.location.get('name', 'Unknown')}"