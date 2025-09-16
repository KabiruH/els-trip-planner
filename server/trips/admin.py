# trips/admin.py
from django.contrib import admin
from .models import Trip, Stop

class StopInline(admin.TabularInline):
    model = Stop
    extra = 0
    fields = ['stop_type', 'sequence', 'planned_arrival_time', 'planned_departure_time', 'duration_minutes', 'is_mandatory']
    readonly_fields = ['created_at']

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'status', 'total_distance', 'planned_start_time', 'is_hos_compliant']
    list_filter = ['status', 'is_hos_compliant', 'created_at']
    search_fields = ['driver__email', 'driver__employee_number']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [StopInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ['driver', 'status', 'current_cycle_hours']
        }),
        ('Locations', {
            'fields': ['current_location', 'pickup_location', 'dropoff_location']
        }),
        ('Trip Metrics', {
            'fields': ['total_distance', 'estimated_duration']
        }),
        ('Timing', {
            'fields': ['planned_start_time', 'actual_start_time', 'estimated_end_time', 'actual_end_time']
        }),
        ('HOS Compliance', {
            'fields': ['is_hos_compliant', 'hos_violations']
        }),
        ('Metadata', {
            'fields': ['id', 'created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    )

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ['trip', 'stop_type', 'sequence', 'planned_arrival_time', 'is_mandatory']
    list_filter = ['stop_type', 'is_mandatory']
    search_fields = ['trip__driver__email']
    readonly_fields = ['id', 'created_at', 'updated_at']