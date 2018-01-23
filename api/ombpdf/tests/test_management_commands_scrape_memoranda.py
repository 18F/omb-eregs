from io import BytesIO
from unittest.mock import Mock

import pytest
from model_mommy import mommy

from ombpdf.management.commands import scrape_memoranda
from reqs.models import Policy, WorkflowPhases


def test_scrape_urls(monkeypatch):
    monkeypatch.setattr(scrape_memoranda, 'requests', Mock())
    scrape_memoranda.requests.get.return_value.content = b"""
        <html>
            <body>
                <a href="/1.pdf">M-01-01, Not in an li</a>
                <ul>
                    <li>
                        <a href="/2.pdf">M-02-02, Everything is right</a>
                    </li>
                    <li>
                        <div>
                            <a href="/3.pdf">M-03-03, Not in an li</a>
                        </div>
                    </li>
                    <li>
                        <a href="/4.pdf">Other link, won't work</a>
                    </li>
                    <li>
                        <a href="/5.exe">M-05-05, Bad file extension</a>
                    </li>
                    <li>
                        <a href="/6.pdf">M-06-06, Second success</a>
                    </li>
                </ul>
            <body>
        </html>
    """

    result = scrape_memoranda.scrape_urls('http://example.com/path/here')
    assert result == {
        'M-02-02': 'http://example.com/2.pdf',
        'M-06-06': 'http://example.com/6.pdf',
    }


@pytest.mark.django_db
def test_parse_pdf_calls(monkeypatch):
    """Lots of mocking here, just to confirm all the pieces are called."""
    monkeypatch.setattr(scrape_memoranda, 'download_with_progress', Mock())
    monkeypatch.setattr(scrape_memoranda, 'OMBDocument', Mock())
    monkeypatch.setattr(scrape_memoranda, 'to_db', Mock())
    scrape_memoranda.download_with_progress.return_value = BytesIO(b'thing')

    policy = mommy.prepare(Policy)
    assert scrape_memoranda.parse_pdf(policy,
                                      'http://example.com/some/pdf/here.pdf')
    assert policy.workflow_phase == WorkflowPhases.cleanup.name

    assert scrape_memoranda.OMBDocument.from_file.called
    pdf_bytes = scrape_memoranda.OMBDocument.from_file.call_args[0][0]
    assert pdf_bytes.name == 'here.pdf'
    assert pdf_bytes.read() == b'thing'

    assert scrape_memoranda.to_db.called


@pytest.mark.django_db
def test_parse_pdf_failure(monkeypatch):
    """An exception should mark the parse as failed."""
    monkeypatch.setattr(scrape_memoranda, 'download_with_progress', Mock())
    monkeypatch.setattr(scrape_memoranda, 'OMBDocument', Mock())
    monkeypatch.setattr(scrape_memoranda, 'to_db', Mock())
    monkeypatch.setattr(scrape_memoranda, 'known_exceptions', (ValueError,))
    scrape_memoranda.download_with_progress.return_value = BytesIO(b'')
    scrape_memoranda.to_db.side_effect = ValueError()

    policy = mommy.prepare(Policy)
    assert not scrape_memoranda.parse_pdf(policy, '')
    assert policy.workflow_phase == WorkflowPhases.failed.name


@pytest.mark.django_db
def test_scrape_memoranda(monkeypatch):
    monkeypatch.setattr(scrape_memoranda, 'scrape_urls', Mock())
    monkeypatch.setattr(scrape_memoranda, 'parse_pdf', Mock())
    scrape_memoranda.scrape_urls.return_value = {
        f'M-0{i}-0{i}': f'http://example.com/path/{i}.pdf'
        for i in range(1, 7)
    }
    # Successes for all but M-03-03
    scrape_memoranda.parse_pdf.side_effect = \
        lambda p, _: not p.omb_policy_id.endswith('3')

    for i in range(1, 5):
        workflow_phase = WorkflowPhases.no_doc.name
        if i == 1:  # Immitate a policy having "already" been processed
            workflow_phase = WorkflowPhases.published.name
        mommy.make(Policy, omb_policy_id=f'M-0{i}-0{i}',
                   workflow_phase=workflow_phase)

    successes, failures = scrape_memoranda.scrape_memoranda()
    # M-01-01 has a docnode, so is ignored
    assert successes == {'M-02-02', 'M-04-04'}
    assert failures == {'M-03-03'}
    # M-05-05 and M-06-06 aren't in the database
