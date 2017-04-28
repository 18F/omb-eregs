from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from taggit.models import Tag

from ereqs_admin.forms import UserChangeForm, UserCreationForm

# We have our own tag type; best to hide the taggit Tags from end users
admin.site.unregister(Tag)


class PasswordlessAdmin(UserAdmin):
    """A replacement user admin which references the modified creation +
    change forms. This also removes the password + is_staff fields and makes
    the user name fields (which are set by our MAX integration) and date
    fields read-only"""
    add_form = UserCreationForm
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username',),
        }),
    )
    readonly_fields = ('last_login', 'date_joined', 'first_name', 'last_name',
                       'email')
    form = UserChangeForm
    fieldsets = (
        (None, {'fields': ('username',)}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {'fields': ('is_active', 'is_superuser', 'groups',
                                       'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )


if settings.MAX_URL:
    admin.site.unregister(User)
    admin.site.register(User, PasswordlessAdmin)
