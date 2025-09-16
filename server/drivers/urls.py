# drivers/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverViewSet

app_name = 'drivers'

router = DefaultRouter()
router.register('', DriverViewSet, basename='driver')

urlpatterns = [
    path('', include(router.urls)),
]