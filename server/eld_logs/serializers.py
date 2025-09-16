# eld_logs/serializers.py
from rest_framework import serializers
from decimal import Decimal
from .models import DailyLog, LogEntry

class LogEntrySerializer(serializers.ModelSerializer):
    duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = LogEntry
        fields = [
            'id', 'duty_status', 'start_time', 'end_time', 
            'duration_minutes', 'duration_hours', 'location', 
            'remarks', 'odometer_reading', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        
        if end_time and start_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time")
        
        return attrs

class LogEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating log entries with duty status changes"""
    
    class Meta:
        model = LogEntry
        fields = [
            'duty_status', 'start_time', 'location', 'remarks', 'odometer_reading'
        ]
    
    def validate_duty_status(self, value):
        valid_statuses = [choice[0] for choice in LogEntry.DUTY_STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid duty status. Must be one of: {valid_statuses}")
        return value

class DailyLogSerializer(serializers.ModelSerializer):
    driver_email = serializers.CharField(source='driver.email', read_only=True)
    log_entries = LogEntrySerializer(many=True, read_only=True)
    total_miles = serializers.ReadOnlyField()
    
    class Meta:
        model = DailyLog
        fields = [
            'id', 'driver', 'driver_email', 'trip', 'log_date', 
            'total_driving_time', 'total_on_duty_time', 'total_off_duty_time', 
            'total_sleeper_berth_time', 'vehicle_id', 'odometer_start', 
            'odometer_end', 'total_miles', 'starting_location', 'ending_location',
            'is_hos_compliant', 'hos_violations', 'is_certified', 
            'certification_datetime', 'log_entries', 'created_at'
        ]
        read_only_fields = [
            'id', 'driver', 'total_miles', 'is_hos_compliant', 'hos_violations',
            'certification_datetime', 'created_at'
        ]
    
    def validate_log_date(self, value):
        # Prevent creating logs for future dates
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot create logs for future dates")
        return value
    
    def validate(self, attrs):
        odometer_start = attrs.get('odometer_start')
        odometer_end = attrs.get('odometer_end')
        
        if odometer_start and odometer_end and odometer_end < odometer_start:
            raise serializers.ValidationError("Ending odometer reading must be greater than starting reading")
        
        return attrs

class DutyStatusChangeSerializer(serializers.Serializer):
    """Serializer for duty status change requests"""
    duty_status = serializers.ChoiceField(choices=LogEntry.DUTY_STATUS_CHOICES)
    location = serializers.JSONField(required=False)
    remarks = serializers.CharField(max_length=500, required=False, allow_blank=True)
    odometer_reading = serializers.IntegerField(required=False, min_value=0)
    
    def validate_location(self, value):
        if value:
            required_fields = ['lat', 'lng']
            for field in required_fields:
                if field not in value:
                    raise serializers.ValidationError(f"Location missing required field: {field}")
            
            # Validate coordinate ranges
            lat = value.get('lat')
            lng = value.get('lng')
            
            if not (-90 <= lat <= 90):
                raise serializers.ValidationError("Latitude must be between -90 and 90")
            if not (-180 <= lng <= 180):
                raise serializers.ValidationError("Longitude must be between -180 and 180")
        
        return value

class HOSSummarySerializer(serializers.Serializer):
    """Serializer for HOS compliance summary"""
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    total_cycle_hours = serializers.DecimalField(max_digits=4, decimal_places=2)
    remaining_cycle_hours = serializers.DecimalField(max_digits=4, decimal_places=2)
    violations_count = serializers.IntegerField()
    can_drive = serializers.BooleanField()
    must_take_34_hour_reset = serializers.BooleanField()
    daily_breakdown = serializers.ListField()

class DailyLogCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating daily logs"""
    
    class Meta:
        model = DailyLog
        fields = [
            'log_date', 'vehicle_id', 'odometer_start', 
            'starting_location'
        ]
    
    def validate_log_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot create logs for future dates")
        return value