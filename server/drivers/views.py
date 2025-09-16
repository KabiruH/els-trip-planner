# drivers/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from .models import Driver
from .serializers import (
    DriverSerializer, DriverCreateSerializer, LoginSerializer,
    DutyStatusUpdateSerializer, DriverStatsSerializer
)

class DriverViewSet(viewsets.ModelViewSet):
    """ViewSet for Driver operations"""
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Drivers can only see their own profile
        return Driver.objects.filter(id=self.request.user.id)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DriverCreateSerializer
        return DriverSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        POST /api/v1/drivers/register/
        Register a new driver account
        """
        serializer = DriverCreateSerializer(data=request.data)
        if serializer.is_valid():
            driver = serializer.save()
            # Create auth token for the new driver
            token, created = Token.objects.get_or_create(user=driver)
            return Response({
                'driver': DriverSerializer(driver).data,
                'token': token.key,
                'message': 'Driver account created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        POST /api/v1/drivers/login/
        Login driver and return auth token
        """
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            login(request, user)
            
            return Response({
                'driver': DriverSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        POST /api/v1/drivers/logout/
        Logout current driver
        """
        try:
            # Delete the user's token
            request.user.auth_token.delete()
        except:
            pass
        
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        GET /api/v1/drivers/me/
        Get current driver's profile
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_duty_status(self, request):
        """
        PATCH /api/v1/drivers/update_duty_status/
        Update driver's current duty status
        """
        serializer = DutyStatusUpdateSerializer(data=request.data)
        if serializer.is_valid():
            new_status = serializer.validated_data['duty_status']
            location = serializer.validated_data.get('location')
            remarks = serializer.validated_data.get('remarks', '')
            
            # Update driver's duty status
            old_status = request.user.current_duty_status
            request.user.current_duty_status = new_status
            request.user.save()
            
            # TODO: Create log entry for duty status change
            # This would be implemented when we add the ELD logs API
            
            return Response({
                'message': f'Duty status updated from {old_status} to {new_status}',
                'old_status': old_status,
                'new_status': new_status,
                'timestamp': timezone.now(),
                'location': location,
                'remarks': remarks
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/v1/drivers/stats/
        Get driver statistics and HOS information
        """
        driver = request.user
        
        # Calculate stats from trips
        trips = driver.trips.all()
        total_trips = trips.count()
        completed_trips = trips.filter(status='completed').count()
        total_miles = trips.aggregate(
            total=Sum('total_distance')
        )['total'] or Decimal('0.00')
        
        # Calculate current cycle hours (last 8 days)
        eight_days_ago = timezone.now() - timedelta(days=8)
        recent_trips = trips.filter(created_at__gte=eight_days_ago)
        
        # Calculate total hours from recent trips
        current_cycle_hours = Decimal('0.00')
        for trip in recent_trips:
            if trip.estimated_duration:
                hours = Decimal(str(trip.estimated_duration.total_seconds() / 3600))
                current_cycle_hours += hours
        
        # Calculate remaining cycle hours
        remaining_cycle_hours = Decimal('70.0') - current_cycle_hours
        
        # Count HOS violations
        hos_violations_count = trips.filter(is_hos_compliant=False).count()
        
        # Get last duty status change (would come from log entries in full implementation)
        last_duty_change = driver.updated_at  # Simplified
        
        stats_data = {
            'total_trips': total_trips,
            'completed_trips': completed_trips,
            'total_miles': total_miles,
            'current_cycle_hours': current_cycle_hours,
            'remaining_cycle_hours': remaining_cycle_hours,
            'hos_violations_count': hos_violations_count,
            'current_duty_status': driver.current_duty_status,
            'last_duty_change': last_duty_change
        }
        
        serializer = DriverStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def hos_status(self, request):
        """
        GET /api/v1/drivers/hos_status/
        Get detailed HOS compliance status
        """
        driver = request.user
        
        # Calculate current cycle hours (last 8 days)
        eight_days_ago = timezone.now() - timedelta(days=8)
        recent_trips = driver.trips.filter(created_at__gte=eight_days_ago)
        
        current_cycle_hours = Decimal('0.00')
        daily_hours = {}
        
        for trip in recent_trips:
            if trip.estimated_duration:
                trip_date = trip.created_at.date()
                trip_date_str = trip_date.isoformat()
                hours = Decimal(str(trip.estimated_duration.total_seconds() / 3600))
                current_cycle_hours += hours
                
                if trip_date_str in daily_hours:
                    daily_hours[trip_date_str] += hours
                else:
                    daily_hours[trip_date_str] = hours
        
        # Calculate today's hours
        today_str = timezone.now().date().isoformat()
        daily_driving_hours = daily_hours.get(today_str, Decimal('0.00'))
        daily_on_duty_hours = daily_driving_hours  # Simplified: assume all trip time is on-duty
        
        # Check for violations
        violations = []
        
        # Daily driving limit (11 hours)
        if daily_driving_hours > 11:
            violations.append(f"Exceeded 11-hour daily driving limit: {daily_driving_hours}h")
        
        # Daily on-duty limit (14 hours) 
        if daily_on_duty_hours > 14:
            violations.append(f"Exceeded 14-hour daily on-duty limit: {daily_on_duty_hours}h")
        
        # 70-hour cycle limit
        if current_cycle_hours > 70:
            violations.append(f"Exceeded 70-hour cycle limit: {current_cycle_hours}h")
        
        # Check for violations in daily_hours
        for date_str, hours in daily_hours.items():
            if hours > 14:
                violations.append(f"Exceeded 14-hour on-duty limit on {date_str}: {hours}h")
        
        # Calculate remaining hours
        remaining_cycle = max(Decimal('0.00'), Decimal('70.0') - current_cycle_hours)
        remaining_daily_driving = max(Decimal('0.00'), Decimal('11.0') - daily_driving_hours)
        remaining_daily_on_duty = max(Decimal('0.00'), Decimal('14.0') - daily_on_duty_hours)
        
        # Determine if driver can drive (fixed logic)
        # Driver can drive if:
        # 1. Under daily driving limit (11h)
        # 2. Under daily on-duty limit (14h) 
        # 3. Under cycle limit (70h)
        # 4. No current violations
        can_drive = (
            daily_driving_hours < 11 and
            daily_on_duty_hours < 14 and
            current_cycle_hours < 70 and
            len(violations) == 0
        )
        
        # Determine if break is required (8 hours driving without 30-min break)
        # Simplified: recommend break at 8 hours of driving
        must_take_break = daily_driving_hours >= 8
        
        return Response({
            'current_duty_status': driver.current_duty_status,
            'current_cycle_hours': current_cycle_hours,
            'remaining_cycle_hours': remaining_cycle,
            'daily_driving_hours': daily_driving_hours,
            'remaining_daily_driving': remaining_daily_driving,
            'daily_on_duty_hours': daily_on_duty_hours,
            'remaining_daily_on_duty': remaining_daily_on_duty,
            'daily_hours_last_8_days': daily_hours,
            'violations': violations,
            'can_drive': can_drive,
            'must_take_break': must_take_break,
            'cycle_reset_date': (timezone.now() + timedelta(days=8)).date().isoformat()
        })
    
    @action(detail=False, methods=['get'])
    def recent_trips(self, request):
        """
        GET /api/v1/drivers/recent_trips/
        Get driver's recent trips (last 30 days)
        """
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_trips = request.user.trips.filter(
            created_at__gte=thirty_days_ago
        ).order_by('-created_at')[:10]
        
        # Import TripSerializer to avoid circular import
        from trips.serializers import TripSerializer
        serializer = TripSerializer(recent_trips, many=True)
        return Response(serializer.data)