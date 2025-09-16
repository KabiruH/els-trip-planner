# trips/serializers.py
from rest_framework import serializers
from .models import Trip, Stop
from django.contrib.auth import get_user_model

Driver = get_user_model()

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = [
            'id', 'stop_type', 'location', 'planned_arrival_time', 
            'planned_departure_time', 'duration_minutes', 'distance_from_previous',
            'is_mandatory', 'notes', 'sequence'
        ]

class TripSerializer(serializers.ModelSerializer):
    stops = StopSerializer(many=True, read_only=True)
    driver_email = serializers.CharField(source='driver.email', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'driver_email', 'current_location', 'pickup_location', 
            'dropoff_location', 'current_cycle_hours', 'total_distance', 
            'estimated_duration', 'status', 'planned_start_time', 
            'estimated_end_time', 'is_hos_compliant', 'hos_violations',
            'stops', 'created_at'
        ]
        read_only_fields = ['id', 'driver', 'total_distance', 'estimated_duration', 'estimated_end_time', 'created_at']

class TripPlanningInputSerializer(serializers.Serializer):
    """Serializer for trip planning API input"""
    current_location = serializers.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    pickup_location = serializers.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    dropoff_location = serializers.JSONField(
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    current_cycle_hours = serializers.DecimalField(
        max_digits=4, 
        decimal_places=1,
        min_value=0,
        max_value=70,
        help_text="Current hours used in 8-day cycle"
    )
    planned_start_time = serializers.DateTimeField()
    
    def validate_current_location(self, value):
        required_fields = ['lat', 'lng', 'address']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        return value
    
    def validate_pickup_location(self, value):
        required_fields = ['lat', 'lng', 'address']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        return value
    
    def validate_dropoff_location(self, value):
        required_fields = ['lat', 'lng', 'address']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        return value

class TripPlanningOutputSerializer(serializers.Serializer):
    """Serializer for trip planning API output"""
    trip = TripSerializer()
    stops = StopSerializer(many=True)
    total_distance = serializers.DecimalField(max_digits=10, decimal_places=2)
    estimated_duration = serializers.DurationField()
    is_hos_compliant = serializers.BooleanField()
    hos_violations = serializers.ListField(required=False)
    route_geometry = serializers.JSONField(required=False)