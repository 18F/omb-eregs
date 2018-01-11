from unittest.mock import Mock, call

import pytest
from django.core.files import File
from model_mommy import mommy
from requests.exceptions import ConnectionError

from ombpdf.management.commands import import_pdfs_from_policies
from reqs.models import Policy, WorkflowPhases


def test_best_url(monkeypatch):
    monkeypatch.setattr(import_pdfs_from_policies, 'requests', Mock())
    import_pdfs_from_policies.requests.head.side_effect = [
        Mock(status_code=404),
        Mock(status_code=500),
        Mock(status_code=200),
        Mock(status_code=200),
    ]

    result = import_pdfs_from_policies.best_url(['aaa', 'bbb', 'ccc', 'ddd'])
    assert result == 'ccc'


def test_best_url_exception(monkeypatch):
    monkeypatch.setattr(import_pdfs_from_policies, 'requests', Mock())
    import_pdfs_from_policies.requests.head.side_effect = ConnectionError()

    result = import_pdfs_from_policies.best_url(['aaa', 'bbb'])
    assert result is None


def test_import_from_policy_obama_whitehouse(monkeypatch):
    monkeypatch.setattr(import_pdfs_from_policies, 'best_url', Mock())
    monkeypatch.setattr(import_pdfs_from_policies, 'parse_pdf', Mock())
    policy = mommy.prepare(Policy, uri='https://www.whitehouse.gov/some/place')

    import_pdfs_from_policies.import_from_policy(policy)
    assert import_pdfs_from_policies.best_url.call_args == call([
        'https://www.whitehouse.gov/some/place',
        'https://obamawhitehouse.archives.gov/some/place',
    ])


def test_import_from_policy_attached_file(monkeypatch):
    monkeypatch.setattr(import_pdfs_from_policies, 'best_url', Mock())
    monkeypatch.setattr(import_pdfs_from_policies, 'parse_pdf', Mock())
    policy = mommy.prepare(
        Policy,
        uri='https://example.com/',
        document_source=File(b'stuff', name='a_file.pdf'),
    )

    import_pdfs_from_policies.import_from_policy(policy)
    assert 'a_file.pdf' in policy.document_source.url
    assert import_pdfs_from_policies.best_url.call_args == call([
        policy.document_source.url,
        'https://example.com/',
    ])


def test_import_from_policy_failures(monkeypatch):
    monkeypatch.setattr(import_pdfs_from_policies, 'best_url', Mock())
    monkeypatch.setattr(import_pdfs_from_policies, 'parse_pdf', Mock())
    policy = mommy.prepare(Policy)

    import_pdfs_from_policies.best_url.return_value = True
    assert import_pdfs_from_policies.import_from_policy(policy)

    import_pdfs_from_policies.best_url.return_value = False
    assert not import_pdfs_from_policies.import_from_policy(policy)

    import_pdfs_from_policies.best_url.return_value = True
    import_pdfs_from_policies.parse_pdf.return_value = False
    assert not import_pdfs_from_policies.import_from_policy(policy)


@pytest.mark.django_db
def test_import_pdfs_from_policies(monkeypatch):
    monkeypatch.setattr(import_pdfs_from_policies, 'import_from_policy',
                        Mock())
    import_pdfs_from_policies.import_from_policy.side_effect = \
        lambda p: p.title.startswith('no-exception')
    p1 = mommy.make(Policy, title='no-exception-1',
                    uri='http://example.com/some/thing.pdf')
    mommy.make(Policy, title='no-exeception-but-not-a-pdf',
               uri='http://example.com/not-a/pdf')
    p3 = mommy.make(Policy, title='no-exception-2',
                    uri='http://example.com/other/pdf.pdf')
    p4 = mommy.make(Policy, title='exception-but-a-pdf',
                    uri='http://example.com/an/exception.pdf')

    successes, failures = import_pdfs_from_policies.import_pdfs_from_policies()

    assert successes == {f'{p1.pk}: no-exception-1',
                         f'{p3.pk}: no-exception-2'}
    assert failures == {f'{p4.pk}: exception-but-a-pdf'}
    # p2 doesn't show up as it's not a pdf

    # make sure the policy objects have the correct workflow_phases:
    p1_db = Policy.objects.get(id=p1.pk)
    assert p1_db.workflow_phase == WorkflowPhases.cleanup.name
    p3_db = Policy.objects.get(id=p3.pk)
    assert p3_db.workflow_phase == WorkflowPhases.cleanup.name
    p4_db = Policy.objects.get(id=p4.pk)
    assert p4_db.workflow_phase == WorkflowPhases.failed.name
