# eld_logs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyLogViewSet, LogEntryViewSet

app_name = 'eld_logs'

router = DefaultRouter()
router.register('daily', DailyLogViewSet, basename='dailylog')
router.register('entries', LogEntryViewSet, basename='logentry')

urlpatterns = [
    path('', include(router.urls)),
]