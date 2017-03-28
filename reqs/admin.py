from dal_select2_taggit.widgets import TaggitSelect2
from django import forms
from django.contrib import admin

from reqs.models import Keyword, Policy, Requirement

admin.site.register(Policy)
admin.site.register(Keyword)


class TaggitWidget(TaggitSelect2):
    """Account for commas in tags by wrapping each entry in double quotes"""
    def value_from_datadict(self, data, files, name):
        values = data.getlist(name)
        values = [v.replace('"', '') for v in values]   # remove double quotes
        values = ['"{0}"'.format(v) for v in values]
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
