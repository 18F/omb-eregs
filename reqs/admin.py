from dal_select2_taggit.widgets import TaggitSelect2
from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from reversion.admin import VersionAdmin

from reqs.models import Policy, Requirement, Topic


def is_extension_pdf(uploaded_file):
    if (not uploaded_file.name.endswith('pdf')
            or uploaded_file.content_type != 'application/pdf'):
        raise ValidationError('The file must be a PDF.')


class PolicyForm(forms.ModelForm):
    document_source = forms.FileField(required=False,
                                      validators=[is_extension_pdf])

    class Meta:
        model = Policy
        fields = '__all__'


@admin.register(Policy)
class PolicyAdmin(VersionAdmin):
    form = PolicyForm
    search_fields = ['title', 'omb_policy_id']
    list_filter = ['policy_type', 'policy_status', 'nonpublic']


@admin.register(Topic)
class TopicAdmin(VersionAdmin):
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
            'topics': TaggitWidget('/admin/ajax/topics/')
        }


@admin.register(Requirement)
class RequirementAdmin(VersionAdmin):
    form = RequirementForm
    search_fields = ['req_id', 'req_text']
