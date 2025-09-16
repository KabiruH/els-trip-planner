# drivers/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Driver

class DriverSerializer(serializers.ModelSerializer):
    """Serializer for Driver profile"""
    class Meta:
        model = Driver
        fields = [
            'id', 'email', 'employee_number', 'current_duty_status',
            'is_active', 'date_joined', 'last_login', 'created_at'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'created_at']

class DriverCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new drivers"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Driver
        fields = ['email', 'employee_number', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_email(self, value):
        if Driver.objects.filter(email=value).exists():
            raise serializers.ValidationError("Driver with this email already exists")
        return value
    
    def validate_employee_number(self, value):
        if Driver.objects.filter(employee_number=value).exists():
            raise serializers.ValidationError("Driver with this employee number already exists")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        driver = Driver.objects.create_user(**validated_data)
        driver.set_password(password)
        driver.save()
        return driver

class LoginSerializer(serializers.Serializer):
    """Serializer for driver login"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            if not user.is_active:
                raise serializers.ValidationError('Driver account is deactivated')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')

class DutyStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating driver duty status"""
    duty_status = serializers.ChoiceField(
        choices=Driver._meta.get_field('current_duty_status').choices
    )
    location = serializers.JSONField(
        required=False,
        help_text="{'lat': float, 'lng': float, 'address': str}"
    )
    remarks = serializers.CharField(max_length=500, required=False)
    
    def validate_location(self, value):
        if value:
            required_fields = ['lat', 'lng']
            for field in required_fields:
                if field not in value:
                    raise serializers.ValidationError(f"Missing required field: {field}")
        return value

class DriverStatsSerializer(serializers.Serializer):
    """Serializer for driver statistics"""
    total_trips = serializers.IntegerField()
    completed_trips = serializers.IntegerField()
    total_miles = serializers.DecimalField(max_digits=10, decimal_places=2)
    current_cycle_hours = serializers.DecimalField(max_digits=4, decimal_places=1)
    remaining_cycle_hours = serializers.DecimalField(max_digits=4, decimal_places=1)
    hos_violations_count = serializers.IntegerField()
    current_duty_status = serializers.CharField()
    last_duty_change = serializers.DateTimeField(required=False)