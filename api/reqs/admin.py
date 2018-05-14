from django.conf.urls import url
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from ereqs_admin.revision_admin import EReqsVersionAdmin
from reqs.forms import DocumentUploadForm
from reqs.models import Agency, AgencyGroup, Office, Policy, Requirement, Topic


@admin.register(Policy)
class PolicyAdmin(EReqsVersionAdmin):
    actions = None
    list_display = ('workflow_phase', '__str__', 'issuance')
    list_display_links = ('__str__',)
    list_filter = ['workflow_phase']
    ordering = ['-issuance', '-pk']
    search_fields = ['title', 'omb_policy_id']
    fields = [
        'title',
        'omb_policy_id',
        'issuance',
        'sunset',
        'workflow_phase',
        'uri'
    ]

    def response_post_save_change(self, request, obj):
        """Redirect to the document import or editor, if that's the button the
        user clicked."""
        policy_id = obj.omb_policy_id or obj.slug
        if '_savethendoc' in request.POST and obj.has_no_document:
            return HttpResponseRedirect(reverse(
                'admin:document_upload', kwargs={'pk': obj.pk}))
        elif '_savethendoc' in request.POST:
            return HttpResponseRedirect(
                reverse('document_editor', kwargs={'policy_id': policy_id}))
        return super().response_post_save_change(request, obj)

    def get_urls(self):
        """Add the document upload view"""
        urls = super().get_urls()
        return [
            url('^(?P<pk>\d+)/document_upload$',
                self.admin_site.admin_view(self.document_upload),
                name='document_upload'),
        ] + urls

    def document_upload(self, request, pk):
        """Handler for uploading new documents."""
        policy = get_object_or_404(Policy, pk=pk)
        if request.method == 'POST':    # submitted form
            form = DocumentUploadForm(request.POST, request.FILES,
                                      instance=policy)
            if form.is_valid():
                form.save()
                return HttpResponseRedirect(reverse(
                    'document_editor',
                    kwargs={'policy_id': policy.omb_policy_id or policy.slug},
                ))
        else:
            form = DocumentUploadForm(instance=policy)
        context = dict(
            self.admin_site.each_context(request),
            form=form,
            title='Document Upload',
        )
        return render(request, 'reqs/admin/document_upload.html', context)


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
