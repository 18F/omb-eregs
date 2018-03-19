from unittest.mock import Mock

from django.core.files.uploadedfile import SimpleUploadedFile
from model_mommy import mommy

from document.tree import DocCursor
from reqs import forms
from reqs.models import Policy


def test_policy_edit_doc_button(admin_client):
    policy = mommy.make(Policy, slug='some-policy')
    root = DocCursor.new_tree('root', policy=policy)
    root.nested_set_renumber()

    result = admin_client.get(f'/admin/reqs/policy/{policy.pk}/change/')
    assert b'_savethendoc' in result.content
    assert b'Save and edit document' in result.content


def test_policy_redirect_no_doc(admin_client):
    policy = mommy.make(Policy, slug='some-policy')

    result = admin_client.post(f'/admin/reqs/policy/{policy.pk}/change/', {
       'title': policy.title,
       'omb_policy_id': '',
       'issuance': policy.issuance.isoformat(),
       'sunset': '',
       'public': 'on',
       'workflow_phase': 'no_doc',
       '_savethendoc': 'Save and edit document',
    })

    assert result.status_code == 302
    assert result['Location'] == (f"/admin/reqs/policy/{policy.pk}/"
                                  "document_upload")


def test_policy_redirect_to_editor(admin_client):
    policy = mommy.make(Policy, slug='some-policy')
    root = DocCursor.new_tree('root', policy=policy)
    root.nested_set_renumber()

    result = admin_client.post(f'/admin/reqs/policy/{policy.pk}/change/', {
       'title': 'Some new policy title',
       'omb_policy_id': '',
       'issuance': policy.issuance.isoformat(),
       'sunset': '',
       'public': 'on',
       'workflow_phase': 'cleanup',
       '_savethendoc': 'Save and edit document',
    })

    assert result.status_code == 302
    assert result['Location'] == '/admin/document-editor/some-policy'

    policy.refresh_from_db()
    assert policy.title == 'Some new policy title'


def test_document_upload_404(admin_client):
    result = admin_client.get(f'/admin/reqs/policy/010101/document_upload')
    assert result.status_code == 404


def test_document_upload_get(admin_client):
    policy = mommy.make(Policy)
    result = admin_client.get(f'/admin/reqs/policy/{policy.pk}/'
                              'document_upload')
    assert b'form' in result.content
    assert b'accept=".pdf"' in result.content
    assert b'document_source' in result.content


def test_document_upload_post(admin_client, monkeypatch):
    monkeypatch.setattr(forms, 'create_document', Mock())

    policy = mommy.make(Policy, slug='some-policy')
    pdf = SimpleUploadedFile('a-file.pdf', b'contents')
    result = admin_client.post(
        f'/admin/reqs/policy/{policy.pk}/document_upload',
        {'document_source': pdf},
    )

    assert result.status_code == 302
    assert result['Location'] == '/admin/document-editor/some-policy'
