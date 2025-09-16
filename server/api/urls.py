# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'api'

urlpatterns = [
   path('v1/drivers/', include('drivers.urls')),
    path('v1/trips/', include('trips.urls')),
    path('v1/logs/', include('eld_logs.urls')),
]