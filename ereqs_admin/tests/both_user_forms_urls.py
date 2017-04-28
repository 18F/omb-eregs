from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.models import User

from ereqs_admin.admin import PasswordlessAdmin
from omb_eregs.urls import urlpatterns

normal_admin = DjangoUserAdmin(User, admin.site)
max_admin = PasswordlessAdmin(User, admin.site)


urlpatterns = [
    url(r'^django_user_form/', include(normal_admin.urls)),
    url(r'^max_user_form/', include(max_admin.urls)),
] + urlpatterns
