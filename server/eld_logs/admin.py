# eld_logs/admin.py
from django.contrib import admin
from .models import DailyLog, LogEntry

class LogEntryInline(admin.TabularInline):
    model = LogEntry
    extra = 0
    fields = ['duty_status', 'start_time', 'end_time', 'duration_minutes', 'odometer_reading']
    readonly_fields = ['created_at']

@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ['driver', 'log_date', 'total_driving_time', 'total_on_duty_time', 'is_hos_compliant', 'is_certified']
    list_filter = ['log_date', 'is_hos_compliant', 'is_certified']
    search_fields = ['driver__email', 'driver__employee_number']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_miles']
    inlines = [LogEntryInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ['driver', 'trip', 'log_date', 'vehicle_id']
        }),
        ('Daily Totals (Hours)', {
            'fields': ['total_driving_time', 'total_on_duty_time', 'total_off_duty_time', 'total_sleeper_berth_time']
        }),
        ('Odometer', {
            'fields': ['odometer_start', 'odometer_end', 'total_miles']
        }),
        ('Locations', {
            'fields': ['starting_location', 'ending_location']
        }),
        ('Compliance', {
            'fields': ['is_hos_compliant', 'hos_violations']
        }),
        ('Certification', {
            'fields': ['is_certified', 'certification_datetime']
        }),
        ('Metadata', {
            'fields': ['id', 'created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    )

@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = ['daily_log', 'duty_status', 'start_time', 'end_time', 'duration_hours']
    list_filter = ['duty_status', 'start_time']
    search_fields = ['daily_log__driver__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'duration_hours']