from django.contrib import admin

from reqs.models import Keyword, Policy, Requirement

admin.site.register(Policy)
admin.site.register(Requirement)
admin.site.register(Keyword)
