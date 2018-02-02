from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from django.urls import reverse

from ereqs_admin.revision_admin import EReqsVersionAdmin
from reqs.models import Agency, AgencyGroup, Office, Policy, Requirement, Topic


def is_extension_pdf(uploaded_file):
    if (not uploaded_file.name.endswith('pdf')
            or uploaded_file.content_type != 'application/pdf'):
        raise ValidationError('The file must be a PDF.')


# This form is temporarily no-longer used. We'll add it back with the pdf
# upload workflow
class PolicyForm(forms.ModelForm):
    document_source = forms.FileField(required=False,
                                      validators=[is_extension_pdf])

    class Meta:
        model = Policy
        fields = '__all__'


@admin.register(Policy)
class PolicyAdmin(EReqsVersionAdmin):
    actions = None
    list_display = ('workflow_phase', '__str__', 'issuance')
    list_display_links = ('__str__',)
    list_filter = ['public', 'workflow_phase']
    ordering = ['-issuance', '-pk']
    search_fields = ['title', 'omb_policy_id']
    fields = [
        'title',
        'omb_policy_id',
        'issuance',
        'sunset',
        'public',
        'workflow_phase',
    ]

    def response_post_save_change(self, request, obj):
        """Redirect to the document editor, if that's the button the user
        clicked."""
        if '_savethendoc' in request.POST:
            policy_id = obj.omb_policy_id or obj.slug
            return HttpResponseRedirect(
                reverse('document_editor', kwargs={'policy_id': policy_id}))
        return super().response_post_save_change(request, obj)


@admin.register(Topic)
class TopicAdmin(EReqsVersionAdmin):
    search_fields = ['name']


@admin.register(Office)
class OfficeAdmin(EReqsVersionAdmin):
    search_fields = ['name']


@admin.register(Requirement)
class RequirementAdmin(EReqsVersionAdmin):
    search_fields = ['req_id', 'req_text']
    filter_horizontal = ['agencies', 'agency_groups', 'topics']
    fields = [
        'policy',
        'req_id',
        'policy_section',
        'policy_sub_section',
        'req_text',
        'verb',
        'impacted_entity',
        'req_deadline',
        'citation',
        'req_status',
        'precedent',
        'related_reqs',
        'omb_data_collection',
        'topics',
        'agencies',
        'agency_groups',
        'public',
    ]


@admin.register(Agency)
class AgencyAdmin(EReqsVersionAdmin):
    fieldsets = (
        ('Editable fields', {'fields': ['public']}),
        ('Imported fields', {
            'description': ('Data for these fields has been imported from '
                            'itdashboard.gov.'),
            'fields': ['name', 'abbr']
        })
    )
    list_display = ['name', 'abbr', 'public']
    list_filter = ['public']
    readonly_fields = ['name', 'abbr']
    search_fields = ['name']

    def has_add_permission(self, request):
        """Don't allow users to add Agencies."""
        return False


@admin.register(AgencyGroup)
class AgencyGroupAdmin(EReqsVersionAdmin):
    fields = ['name', 'agencies']
    filter_horizontal = ['agencies']
    search_fields = ['name']
