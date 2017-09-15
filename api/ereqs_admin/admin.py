from django.conf import settings
from django.contrib.admin import AdminSite
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.models import Group, User
from django.utils.translation import gettext_lazy as _

from ereqs_admin.forms import UserChangeForm, UserCreationForm
from reqs.admin import (AgencyAdmin, AgencyGroupAdmin, OfficeAdmin,
                        PolicyAdmin, RequirementAdmin, TopicAdmin)
from reqs.models import Agency, AgencyGroup, Office, Policy, Requirement, Topic


class EReqsAdminSite(AdminSite):
    site_header = settings.ADMIN_TITLE
    site_title = settings.ADMIN_TITLE
    site_url = None
    index_title = 'Welcome'


class PasswordlessUserAdmin(UserAdmin):
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


admin_site = EReqsAdminSite()

admin_site.register(Group, GroupAdmin)

admin_site.register(Agency, AgencyAdmin)
admin_site.register(AgencyGroup, AgencyGroupAdmin)
admin_site.register(Office, OfficeAdmin)
admin_site.register(Policy, PolicyAdmin)
admin_site.register(Requirement, RequirementAdmin)
admin_site.register(Topic, TopicAdmin)

if settings.MAX_URL:
    admin_site.register(User, PasswordlessUserAdmin)
else:
    admin_site.register(User, UserAdmin)
