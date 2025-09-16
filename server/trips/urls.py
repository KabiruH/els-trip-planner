# trips/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, StopViewSet

app_name = 'trips'

router = DefaultRouter()
router.register('', TripViewSet, basename='trip')
router.register('stops', StopViewSet, basename='stop')

urlpatterns = [
    path('', include(router.urls)),
]