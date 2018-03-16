import logging

import reversion
from django import forms
from django.core.validators import FileExtensionValidator
from django.db import connection, transaction

from document.models import DocNode
from ombpdf.document import OMBDocument
from ombpdf.management.commands.migrate_documents import migrate_doc
from ombpdf.semdb import to_db
from reqs.models import Policy, Requirement, WorkflowPhases

logger = logging.getLogger(__name__)


def create_document(policy: Policy):
    """Attempt to parse the PDF associated with this policy, applying document
    migrations for misparses."""
    try:
        DocNode.objects.filter(policy=policy).delete()
        parsed_pdf = OMBDocument.from_file(policy.document_source.file)
        cursor = to_db(parsed_pdf, policy)
        policy.workflow_phase = WorkflowPhases.cleanup.name
        policy.save()
        migrate_doc(cursor)
    except:     # noqa - don't know the exceptions we'll raise
        logger.exception('Error loading document')
        policy.workflow_phase = WorkflowPhases.failed.name
        policy.save()


def create_requirements(policy: Policy):
    """We're currently searching over *requirements* rather than policy text.
    This is a big hack to keep the app functional as users upload new
    documents. It creates a requirement for every doc node."""
    Requirement.objects.filter(policy=policy).delete()
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO reqs_requirement
                (policy_id, req_id, req_text, public,
                 -- blank text fields
                 policy_section, policy_sub_section, verb, impacted_entity,
                 req_deadline, citation, req_status, precedent, related_reqs,
                 omb_data_collection)
            SELECT
                document_docnode.policy_id,
                 -- construct a unique req_id
                 'pdf.' || CAST(document_docnode.id AS text),
                 document_docnode.text, -- req_text
                 true, -- public
                 -- blank text fields
                 '', '', '', '', '', '', '', '', '', ''
            FROM document_docnode
            WHERE document_docnode.policy_id = %s
            AND document_docnode.text <> ''
        """, [policy.pk])


class DocumentUploadForm(forms.ModelForm):
    document_source = forms.FileField(
        required=True, validators=[FileExtensionValidator(['pdf'])])

    class Meta:
        model = Policy
        fields = ['document_source']

    @transaction.atomic
    def save(self, commit=True):
        if commit:
            with reversion.create_revision():
                policy = super().save()
                create_document(policy)
                create_requirements(policy)
                return policy
        else:
            return super().save(False)
