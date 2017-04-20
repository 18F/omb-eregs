from django.contrib import admin
from taggit.models import Tag

# We have our own tag type; best to hide the taggit Tags from end users
admin.site.unregister(Tag)
