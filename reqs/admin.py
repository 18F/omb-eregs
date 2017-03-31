from dal_select2_taggit.widgets import TaggitSelect2
from django import forms
from django.contrib import admin
from reversion.admin import VersionAdmin
from taggit.models import Tag

from reqs.models import Keyword, Policy, Requirement

# We have our own tag type; best to hide the taggit Tags from end users
admin.site.unregister(Tag)


@admin.register(Policy)
class PolicyAdmin(VersionAdmin):
    search_fields = ['title', 'omb_policy_id']


@admin.register(Keyword)
class KeywordAdmin(VersionAdmin):
    search_fields = ['name']


def handle_quotation_marks(value):
    """Account for commas and quotation marks in tags."""
    num_marks = value.count('"')
    if num_marks % 2 != 0:
        value = value.replace('"', '')
    else:
        while '"' in value:
            marks = ("“", "”")
            value = value.replace('"', marks[value.count('"') % 2], 1)

    return '"{0}"'.format(value)


class TaggitWidget(TaggitSelect2):
    """Account for commas in tags by wrapping each entry in double quotes"""
    def value_from_datadict(self, data, files, name):
        values = data.getlist(name)
        values = [handle_quotation_marks(v) for v in values]
        return ','.join(values)


class RequirementForm(forms.ModelForm):
    class Meta:
        model = Requirement
        fields = '__all__'
        widgets = {
            'keywords': TaggitWidget('/admin/ajax/keywords/')
        }


@admin.register(Requirement)
class RequirementAdmin(VersionAdmin):
    form = RequirementForm
    search_fields = ['req_id', 'req_text']
