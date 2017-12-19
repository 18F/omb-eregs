from datetime import date

import pytest
from model_mommy import mommy

from ombpdf import semdb
from reqs.models import Policy


@pytest.mark.django_db
def test_m_14_10_import(m_14_10_doc):
    policy = mommy.make(
        Policy, issuance=date(2001, 2, 3), omb_policy_id='M-18-18',
        title='Some Title', uri='http://example.com/thing.pdf',
    )
    root = semdb.to_db(m_14_10_doc, policy)

    start = 'Office of Management and Budget (OMB) Memorandum M-12-16, '
    end = 'cash flow and prompt payment to small business subcontractors.'

    assert list(root.filter(
        lambda n: n.text.startswith(start) and n.text.endswith(end)
    ))
