from unittest.mock import Mock, call

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from model_mommy import mommy

from document.tree import DocCursor
from reqs import forms
from reqs.models import Policy, Requirement


@pytest.mark.django_db
def test_document_source_is_set(monkeypatch):
    monkeypatch.setattr(forms, 'create_document', Mock())
    monkeypatch.setattr(forms, 'create_requirements', Mock())
    policy = mommy.make(Policy)
    upload = SimpleUploadedFile('a_filename.pdf', b'content here')

    form = forms.DocumentUploadForm(
        None, files={'document_source': upload}, instance=policy)
    assert form.is_valid()
    result = form.save()

    assert result.pk == policy.pk
    assert result.document_source.name.startswith('a_filename')
    assert result.document_source.name.endswith('.pdf')
    assert result.document_source.read() == b'content here'
    assert forms.create_document.called
    assert forms.create_requirements.called


def test_file_validation():
    policy = mommy.prepare(Policy)
    upload = SimpleUploadedFile('a_jpeg.jpg', b'content here')

    form = forms.DocumentUploadForm(
        None, files={'document_source': upload}, instance=policy)
    assert not form.is_valid()


@pytest.mark.django_db
def test_create_document_success(monkeypatch):
    monkeypatch.setattr(forms, 'OMBDocument', Mock())
    monkeypatch.setattr(forms, 'to_db', Mock())
    monkeypatch.setattr(forms, 'migrate_doc', Mock())
    policy = mommy.make(
        Policy, document_source=SimpleUploadedFile('a.pdf', b'aaa'))
    doc = DocCursor.new_tree('policy', policy=policy)
    doc.add_child('para', text='Content')
    doc.nested_set_renumber()
    forms.to_db.return_value = doc

    forms.create_document(policy)

    assert forms.OMBDocument.from_file.call_args ==\
        call(policy.document_source.file)
    assert forms.to_db.called
    assert policy.workflow_phase == 'cleanup'
    assert forms.migrate_doc.called


@pytest.mark.django_db
def test_create_document_failure_pdf(monkeypatch):
    monkeypatch.setattr(forms, 'OMBDocument', Mock())
    forms.OMBDocument.from_file.side_effect = ValueError('oh noes')

    policy = mommy.make(
        Policy, document_source=SimpleUploadedFile('a.pdf', b'aaa'))
    forms.create_document(policy)

    assert policy.workflow_phase == 'failed'


@pytest.mark.django_db
def test_create_requirements():
    policy = mommy.make(Policy)
    mommy.make(Requirement, policy=policy, _quantity=5)
    doc = DocCursor.new_tree('policy', policy=policy)
    doc.add_child('para', text='First paragraph')
    doc.add_child('sec')
    doc['sec_1'].add_child('heading', text='A section')
    doc['sec_1'].add_child('para', text='Second paragraph')
    doc['sec_1'].add_child('para', text='Final paragraph')
    doc.nested_set_renumber()
    # These will be deleted
    assert Requirement.objects.filter(policy=policy).count() == 5

    forms.create_requirements(policy)

    assert Requirement.objects.filter(policy=policy).count() == 4
    assert set(Requirement.objects.values_list('req_text', flat=True)) == {
        'First paragraph', 'A section', 'Second paragraph', 'Final paragraph',
    }
