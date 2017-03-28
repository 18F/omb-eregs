from dal_select2_taggit.widgets import TaggitSelect2
from django import forms
from django.contrib import admin

from reqs.models import Keyword, Policy, Requirement

admin.site.register(Policy)
admin.site.register(Keyword)


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
class RequirementAdmin(admin.ModelAdmin):
    form = RequirementForm
