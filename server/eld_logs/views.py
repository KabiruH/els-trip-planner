# eld_logs/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime, timedelta, date
from decimal import Decimal

from .models import DailyLog, LogEntry
from .serializers import DailyLogSerializer, LogEntrySerializer

class DailyLogViewSet(viewsets.ModelViewSet):
    """ViewSet for Daily Log operations"""
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyLog.objects.filter(driver=self.request.user).order_by('-log_date')
    
    def perform_create(self, serializer):
        serializer.save(driver=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        GET /api/v1/logs/daily/today/
        Get today's daily log or create one if it doesn't exist
        """
        today = timezone.now().date()
        daily_log, created = DailyLog.objects.get_or_create(
            driver=request.user,
            log_date=today,
            defaults={
                'vehicle_id': '',
                'total_driving_time': Decimal('0.00'),
                'total_on_duty_time': Decimal('0.00'),
                'total_off_duty_time': Decimal('0.00'),
                'total_sleeper_berth_time': Decimal('0.00'),
            }
        )
        
        serializer = self.get_serializer(daily_log)
        return Response({
            'daily_log': serializer.data,
            'created': created,
            'message': 'Today\'s log created' if created else 'Today\'s log retrieved'
        })
    
    @action(detail=True, methods=['post'])
    def certify(self, request, pk=None):
        """
        POST /api/v1/logs/daily/{id}/certify/
        Certify a daily log (driver signature)
        """
        daily_log = self.get_object()
        
        if daily_log.is_certified:
            return Response(
                {'error': 'Log is already certified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as certified
        daily_log.is_certified = True
        daily_log.certification_datetime = timezone.now()
        
        # Recalculate totals before certifying
        daily_log = self._recalculate_daily_totals(daily_log)
        daily_log.save()
        
        return Response({
            'message': 'Daily log certified successfully',
            'certification_datetime': daily_log.certification_datetime
        })
    
    @action(detail=False, methods=['get'])
    def week(self, request):
        """
        GET /api/v1/logs/daily/week/
        Get logs for the current week
        """
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        logs = self.get_queryset().filter(
            log_date__gte=week_start,
            log_date__lte=week_end
        )
        
        serializer = self.get_serializer(logs, many=True)
        return Response({
            'week_start': week_start,
            'week_end': week_end,
            'logs': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def hos_summary(self, request):
        """
        GET /api/v1/logs/daily/hos_summary/
        Get HOS compliance summary for last 8 days
        """
        eight_days_ago = timezone.now().date() - timedelta(days=8)
        logs = self.get_queryset().filter(log_date__gte=eight_days_ago)
        
        # Calculate totals
        total_cycle_hours = logs.aggregate(
            total=Sum('total_on_duty_time')
        )['total'] or Decimal('0.00')
        
        violations_count = logs.filter(is_hos_compliant=False).count()
        
        # Get daily breakdown
        daily_breakdown = []
        for log in logs:
            daily_breakdown.append({
                'date': log.log_date,
                'driving_hours': log.total_driving_time,
                'on_duty_hours': log.total_on_duty_time,
                'off_duty_hours': log.total_off_duty_time,
                'is_compliant': log.is_hos_compliant,
                'violations': log.hos_violations
            })
        
        remaining_hours = Decimal('70.0') - total_cycle_hours
        
        return Response({
            'period_start': eight_days_ago,
            'period_end': timezone.now().date(),
            'total_cycle_hours': total_cycle_hours,
            'remaining_cycle_hours': remaining_hours,
            'violations_count': violations_count,
            'daily_breakdown': daily_breakdown,
            'can_drive': remaining_hours > 0,
            'must_take_34_hour_reset': total_cycle_hours >= 70
        })
    
    def _recalculate_daily_totals(self, daily_log):
        """Recalculate daily totals from log entries"""
        entries = daily_log.log_entries.all()
        
        # Reset totals
        daily_log.total_driving_time = Decimal('0.00')
        daily_log.total_on_duty_time = Decimal('0.00')
        daily_log.total_off_duty_time = Decimal('0.00')
        daily_log.total_sleeper_berth_time = Decimal('0.00')
        
        # Calculate totals from entries
        for entry in entries:
            if entry.duration_minutes:
                hours = Decimal(str(entry.duration_minutes)) / 60
                
                if entry.duty_status == 'driving':
                    daily_log.total_driving_time += hours
                    daily_log.total_on_duty_time += hours
                elif entry.duty_status == 'on_duty_not_driving':
                    daily_log.total_on_duty_time += hours
                elif entry.duty_status == 'off_duty':
                    daily_log.total_off_duty_time += hours
                elif entry.duty_status == 'sleeper_berth':
                    daily_log.total_sleeper_berth_time += hours
        
        # Check HOS compliance
        violations = []
        if daily_log.total_driving_time > 11:
            violations.append("Exceeded 11-hour driving limit")
        if daily_log.total_on_duty_time > 14:
            violations.append("Exceeded 14-hour on-duty limit")
        
        daily_log.hos_violations = violations if violations else None
        daily_log.is_hos_compliant = len(violations) == 0
        
        return daily_log

class LogEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for Log Entry operations"""
    serializer_class = LogEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LogEntry.objects.filter(
            daily_log__driver=self.request.user
        ).order_by('-start_time')
    
    def perform_create(self, serializer):
        # Get or create today's daily log
        today = timezone.now().date()
        daily_log, created = DailyLog.objects.get_or_create(
            driver=self.request.user,
            log_date=today,
            defaults={
                'total_driving_time': Decimal('0.00'),
                'total_on_duty_time': Decimal('0.00'),
                'total_off_duty_time': Decimal('0.00'),
                'total_sleeper_berth_time': Decimal('0.00'),
            }
        )
        
        # Calculate duration if end_time is provided
        log_entry = serializer.save(daily_log=daily_log)
        
        # Update driver's current duty status
        self.request.user.current_duty_status = log_entry.duty_status
        self.request.user.save()
        
        # Recalculate daily log totals
        self._update_daily_log_totals(daily_log)
    
    def perform_update(self, serializer):
        log_entry = serializer.save()
        
        # Update driver's current duty status if this is the latest entry
        latest_entry = LogEntry.objects.filter(
            daily_log__driver=self.request.user
        ).order_by('-start_time').first()
        
        if latest_entry and latest_entry.id == log_entry.id:
            self.request.user.current_duty_status = log_entry.duty_status
            self.request.user.save()
        
        # Recalculate daily log totals
        self._update_daily_log_totals(log_entry.daily_log)
    
    @action(detail=False, methods=['post'])
    def add_duty_change(self, request):
        """
        POST /api/v1/logs/entries/add_duty_change/
        Add a new duty status change entry
        """
        data = request.data.copy()
        
        # Set start_time to now if not provided
        if 'start_time' not in data:
            data['start_time'] = timezone.now()
        
        # Get the previous entry to calculate duration
        previous_entry = LogEntry.objects.filter(
            daily_log__driver=request.user,
            start_time__lt=data['start_time']
        ).order_by('-start_time').first()
        
        if previous_entry and not previous_entry.end_time:
            # End the previous entry
            previous_entry.end_time = data['start_time']
            duration = (previous_entry.end_time - previous_entry.start_time).total_seconds() / 60
            previous_entry.duration_minutes = int(duration)
            previous_entry.save()
        
        # Create new entry
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'log_entry': serializer.data,
                'message': 'Duty status change recorded'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        GET /api/v1/logs/entries/today/
        Get today's log entries
        """
        today = timezone.now().date()
        entries = self.get_queryset().filter(daily_log__log_date=today)
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)
    
    def _update_daily_log_totals(self, daily_log):
        """Update daily log totals after entry changes"""
        entries = daily_log.log_entries.all()
        
        # Reset totals
        daily_log.total_driving_time = Decimal('0.00')
        daily_log.total_on_duty_time = Decimal('0.00')
        daily_log.total_off_duty_time = Decimal('0.00')
        daily_log.total_sleeper_berth_time = Decimal('0.00')
        
        # Calculate totals
        for entry in entries:
            if entry.duration_minutes:
                hours = Decimal(str(entry.duration_minutes)) / 60
                
                if entry.duty_status == 'driving':
                    daily_log.total_driving_time += hours
                    daily_log.total_on_duty_time += hours
                elif entry.duty_status == 'on_duty_not_driving':
                    daily_log.total_on_duty_time += hours
                elif entry.duty_status == 'off_duty':
                    daily_log.total_off_duty_time += hours
                elif entry.duty_status == 'sleeper_berth':
                    daily_log.total_sleeper_berth_time += hours
        
        # Check compliance
        violations = []
        if daily_log.total_driving_time > 11:
            violations.append("Exceeded 11-hour driving limit")
        if daily_log.total_on_duty_time > 14:
            violations.append("Exceeded 14-hour on-duty limit")
        
        daily_log.hos_violations = violations if violations else None
        daily_log.is_hos_compliant = len(violations) == 0
        daily_log.save()