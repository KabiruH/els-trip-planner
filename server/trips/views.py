# trips/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from datetime import datetime, timedelta
from decimal import Decimal
import math

from .models import Trip, Stop
from .serializers import (
    TripSerializer, StopSerializer, 
    TripPlanningInputSerializer, TripPlanningOutputSerializer
)

class TripViewSet(viewsets.ModelViewSet):
    """ViewSet for Trip CRUD operations"""
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(driver=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(driver=self.request.user)
    
    @action(detail=False, methods=['post'])
    def plan(self, request):
        """
        POST /api/v1/trips/plan/
        Plan a new trip with HOS compliance
        
        Input: current_location, pickup_location, dropoff_location, current_cycle_hours, planned_start_time
        Output: HOS-compliant trip with mandatory stops and route
        """
        # Validate input
        input_serializer = TripPlanningInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = input_serializer.validated_data
        
        try:
            # Plan the trip with HOS compliance
            trip_data = self._plan_hos_compliant_trip(
                driver=request.user,
                current_location=validated_data['current_location'],
                pickup_location=validated_data['pickup_location'],
                dropoff_location=validated_data['dropoff_location'],
                current_cycle_hours=validated_data['current_cycle_hours'],
                planned_start_time=validated_data['planned_start_time']
            )
            
            # Return the planned trip
            output_serializer = TripPlanningOutputSerializer(trip_data)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Trip planning failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _plan_hos_compliant_trip(self, driver, current_location, pickup_location, 
                                dropoff_location, current_cycle_hours, planned_start_time):
        """
        Core trip planning logic with HOS compliance
        """
        # Get HOS regulations from settings
        hos_regs = settings.HOS_REGULATIONS
        max_driving_hours = hos_regs['MAX_DRIVING_HOURS']
        max_on_duty_hours = hos_regs['MAX_ON_DUTY_HOURS']
        min_off_duty_hours = hos_regs['MIN_OFF_DUTY_HOURS']
        fuel_interval_miles = hos_regs['FUEL_INTERVAL_MILES']
        pickup_dropoff_duration = hos_regs['PICKUP_DROPOFF_DURATION']
        
        # Calculate distances (simplified - in production use real routing API)
        total_distance = self._calculate_total_distance(
            current_location, pickup_location, dropoff_location
        )
        
        # Estimate driving time (assume 60 mph average)
        estimated_driving_hours = total_distance / 60
        
        # Calculate total trip time including pickup/dropoff
        total_trip_hours = estimated_driving_hours + (2 * pickup_dropoff_duration)  # pickup + dropoff
        
        # Check HOS compliance
        hos_violations = []
        is_hos_compliant = True
        
        # Check if trip exceeds daily driving limit
        if estimated_driving_hours > max_driving_hours:
            hos_violations.append(f"Trip requires {estimated_driving_hours:.1f} hours driving, exceeds {max_driving_hours} hour limit")
            is_hos_compliant = False
        
        # Check if trip exceeds daily on-duty limit
        if total_trip_hours > max_on_duty_hours:
            hos_violations.append(f"Trip requires {total_trip_hours:.1f} hours on duty, exceeds {max_on_duty_hours} hour limit")
            is_hos_compliant = False
        
        # Check cycle hours
        remaining_cycle_hours = 70 - float(current_cycle_hours)
        if total_trip_hours > remaining_cycle_hours:
            hos_violations.append(f"Trip requires {total_trip_hours:.1f} hours, but only {remaining_cycle_hours:.1f} hours remaining in cycle")
            is_hos_compliant = False
        
        # Create trip
        trip = Trip.objects.create(
            driver=driver,
            current_location=current_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            current_cycle_hours=current_cycle_hours,
            total_distance=Decimal(str(total_distance)),
            estimated_duration=timedelta(hours=total_trip_hours),
            planned_start_time=planned_start_time,
            estimated_end_time=planned_start_time + timedelta(hours=total_trip_hours),
            is_hos_compliant=is_hos_compliant,
            hos_violations=hos_violations if hos_violations else None
        )
        
        # Generate stops
        stops = self._generate_stops(trip, total_distance, planned_start_time, 
                                   estimated_driving_hours, pickup_dropoff_duration)
        
        return {
            'trip': trip,
            'stops': stops,
            'total_distance': total_distance,
            'estimated_duration': timedelta(hours=total_trip_hours),
            'is_hos_compliant': is_hos_compliant,
            'hos_violations': hos_violations,
            'route_geometry': None  # Will be added when we integrate mapping API
        }
    
    def _calculate_total_distance(self, current_location, pickup_location, dropoff_location):
        """
        Calculate total trip distance using Haversine formula
        In production, replace with actual routing API
        """
        def haversine_distance(lat1, lon1, lat2, lon2):
            # Convert to radians
            lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
            
            # Haversine formula
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            
            # Earth radius in miles
            r = 3956
            return c * r
        
        # Distance from current to pickup
        distance_to_pickup = haversine_distance(
            current_location['lat'], current_location['lng'],
            pickup_location['lat'], pickup_location['lng']
        )
        
        # Distance from pickup to dropoff
        distance_pickup_to_dropoff = haversine_distance(
            pickup_location['lat'], pickup_location['lng'],
            dropoff_location['lat'], dropoff_location['lng']
        )
        
        return distance_to_pickup + distance_pickup_to_dropoff
    
    def _generate_stops(self, trip, total_distance, start_time, driving_hours, pickup_dropoff_duration):
        """
        Generate mandatory stops (pickup, dropoff, fuel, rest)
        """
        stops = []
        current_time = start_time
        sequence = 1
        distance_covered = 0
        
        # Calculate distances
        distance_to_pickup = self._calculate_distance_between_points(
            trip.current_location, trip.pickup_location
        )
        distance_pickup_to_dropoff = self._calculate_distance_between_points(
            trip.pickup_location, trip.dropoff_location
        )
        
        # Stop 1: Pickup
        pickup_arrival = current_time + timedelta(hours=distance_to_pickup/60)
        pickup_departure = pickup_arrival + timedelta(hours=pickup_dropoff_duration)
        
        pickup_stop = Stop.objects.create(
            trip=trip,
            stop_type='pickup',
            location=trip.pickup_location,
            planned_arrival_time=pickup_arrival,
            planned_departure_time=pickup_departure,
            duration_minutes=int(pickup_dropoff_duration * 60),
            distance_from_previous=Decimal(str(distance_to_pickup)),
            sequence=sequence,
            is_mandatory=True
        )
        stops.append(pickup_stop)
        sequence += 1
        current_time = pickup_departure
        distance_covered += distance_to_pickup
        
        # Add fuel stops if needed (every 1000 miles)
        fuel_interval = settings.HOS_REGULATIONS['FUEL_INTERVAL_MILES']
        if distance_pickup_to_dropoff > fuel_interval:
            # Add fuel stop(s) between pickup and dropoff
            fuel_stops_needed = int(distance_pickup_to_dropoff / fuel_interval)
            for i in range(fuel_stops_needed):
                fuel_distance = (i + 1) * fuel_interval
                fuel_time = current_time + timedelta(hours=fuel_distance/60)
                
                # Create approximate fuel stop location (midpoint for simplicity)
                fuel_location = {
                    'lat': (trip.pickup_location['lat'] + trip.dropoff_location['lat']) / 2,
                    'lng': (trip.pickup_location['lng'] + trip.dropoff_location['lng']) / 2,
                    'address': f"Fuel Stop {i+1}",
                    'name': f"Fuel Stop {i+1}"
                }
                
                fuel_stop = Stop.objects.create(
                    trip=trip,
                    stop_type='fuel',
                    location=fuel_location,
                    planned_arrival_time=fuel_time,
                    planned_departure_time=fuel_time + timedelta(minutes=30),
                    duration_minutes=30,
                    distance_from_previous=Decimal(str(fuel_interval)),
                    sequence=sequence,
                    is_mandatory=True
                )
                stops.append(fuel_stop)
                sequence += 1
                current_time = fuel_time + timedelta(minutes=30)
        
        # Stop: Dropoff
        dropoff_arrival = current_time + timedelta(hours=(distance_pickup_to_dropoff - (len([s for s in stops if s.stop_type == 'fuel']) * fuel_interval))/60)
        dropoff_departure = dropoff_arrival + timedelta(hours=pickup_dropoff_duration)
        
        dropoff_stop = Stop.objects.create(
            trip=trip,
            stop_type='dropoff',
            location=trip.dropoff_location,
            planned_arrival_time=dropoff_arrival,
            planned_departure_time=dropoff_departure,
            duration_minutes=int(pickup_dropoff_duration * 60),
            distance_from_previous=Decimal(str(distance_pickup_to_dropoff - (len([s for s in stops if s.stop_type == 'fuel']) * fuel_interval))),
            sequence=sequence,
            is_mandatory=True
        )
        stops.append(dropoff_stop)
        
        return stops
    
    def _calculate_distance_between_points(self, point1, point2):
        """Helper to calculate distance between two points"""
        def haversine_distance(lat1, lon1, lat2, lon2):
            lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            r = 3956  # Earth radius in miles
            return c * r
        
        return haversine_distance(
            point1['lat'], point1['lng'],
            point2['lat'], point2['lng']
        )

class StopViewSet(viewsets.ModelViewSet):
    """ViewSet for Stop CRUD operations"""
    serializer_class = StopSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Stop.objects.filter(trip__driver=self.request.user)