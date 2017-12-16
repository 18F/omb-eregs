from datetime import date

import pytest
from model_mommy import mommy

from ombpdf import semdb
from reqs.models import Policy


def assert_has_paragraph(doctree, start, end):
    items = [doctree]

    while items:
        item = items.pop()
        if item['node_type'] == 'para':
            text = item['content'][0]['text']
            if text.startswith(start) and text.endswith(end):
                return
        items.extend([child for child in item['children']])

    raise AssertionError(f'Document has no paragraph w/ text "{text}"')


@pytest.mark.django_db
def test_m_14_10_import(m_14_10_doc):
    policy = mommy.make(
        Policy, issuance=date(2001, 2, 3), omb_policy_id='M-18-18',
        title='Some Title', uri='http://example.com/thing.pdf',
    )
    result = semdb.to_db(m_14_10_doc, policy).serialize()

    assert_has_paragraph(
        result,
        start='Office of Management and Budget (OMB) Memorandum M-12-16, ',
        end='cash flow and prompt payment to small business subcontractors. '
    )
