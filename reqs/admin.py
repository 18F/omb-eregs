from dal_select2_taggit.widgets import TaggitSelect2
from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from reversion.admin import VersionAdmin

from reqs.models import Agency, AgencyGroup, Office, Policy, Requirement, Topic


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
    radio_fields = {'policy_type': admin.VERTICAL}


@admin.register(Topic)
class TopicAdmin(VersionAdmin):
    search_fields = ['name']


@admin.register(Office)
class OfficeAdmin(VersionAdmin):
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
        exclude = ['all_agencies']
        widgets = {
            'topics': TaggitWidget('/admin/ajax/topics/')
        }


@admin.register(Requirement)
class RequirementAdmin(VersionAdmin):
    form = RequirementForm
    search_fields = ['req_id', 'req_text']
    filter_horizontal = ['agencies', 'agency_groups']


@admin.register(Agency)
class AgencyAdmin(VersionAdmin):
    fieldsets = (
        ('Editable fields', {'fields': ['nonpublic']}),
        ('Imported fields', {
            'description': ('Data for these fields has been imported from '
                            'itdashboard.gov.'),
            'fields': ['name', 'abbr']
        })
    )
    list_display = ['name', 'abbr', 'nonpublic']
    list_filter = ['nonpublic']
    readonly_fields = ['name', 'abbr']
    search_fields = ['name']

    def has_add_permission(self, request):
        """Don't allow users to add Agencies."""
        return False


@admin.register(AgencyGroup)
class AgencyGroupAdmin(VersionAdmin):
    fields = ['name', 'agencies']
    filter_horizontal = ['agencies']
    search_fields = ['name']
