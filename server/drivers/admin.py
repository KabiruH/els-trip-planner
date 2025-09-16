# drivers/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Driver

@admin.register(Driver)
class DriverAdmin(UserAdmin):
    list_display = ('email', 'employee_number', 'current_duty_status', 'is_staff', 'date_joined')
    list_filter = ('current_duty_status', 'is_staff', 'is_active')
    search_fields = ('email', 'employee_number')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Driver Information', {'fields': ('employee_number', 'current_duty_status')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'employee_number', 'password1', 'password2'),
        }),
    )