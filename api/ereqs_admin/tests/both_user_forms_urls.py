from django.conf.urls import include, url
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.models import User

from ereqs_admin.admin import PasswordlessUserAdmin, admin_site
from omb_eregs.urls import urlpatterns

normal_admin = DjangoUserAdmin(User, admin_site)
max_admin = PasswordlessUserAdmin(User, admin_site)


urlpatterns = [
    url(r'^django_user_form/', include(normal_admin.urls)),
    url(r'^max_user_form/', include(max_admin.urls)),
] + urlpatterns
