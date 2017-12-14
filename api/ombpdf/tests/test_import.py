from datetime import date
from itertools import groupby
from model_mommy import mommy
from operator import attrgetter
from unittest import mock
from document.models import DocNode, PlainText
from document.serializers import doc_cursor
from document.tree import DocCursor
from reqs.models import Policy

import pytest


@pytest.mark.django_db
def test_m_14_10_import(m_14_10_doc):
    policy = mommy.make(
        Policy, issuance=date(2001, 2, 3), omb_policy_id='M-18-18',
        title='Some Title', uri='http://example.com/thing.pdf',
    )
    root = DocCursor.new_tree('root', '0', policy=policy, title='Policy A')
    m_14_10_doc.annotators.require_all()
    lines = m_14_10_doc.pages[0]
    grouped = groupby(lines, key=attrgetter("annotation"))
    groups = [list(g) for k, g in grouped]
    for i, group in enumerate(groups):
        text = "".join([str(l) for l in group])
        root.add_child('par', str(i), text=text, marker=str(i))
    root.nested_set_renumber()
    result = doc_cursor.DocCursorSerializer(
        root, context={'policy': policy}).data
    first_para = 'Office of Management and Budget (OMB) Memorandum M-12-16, '\
    '"Providing Prompt Payment to Small Business Subcontractors," '\
    'established the Executive Branch policy that agencies should, to the '\
    'full extent permitted by law, temporarily accelerate payments to all '\
    'prime contractors -with a goal of paying them within 15 days '\
    'ofreceipt of proper invoices -in order to allow them to provide '\
    'prompt payments to small business subcontractors. To support the '\
    'policy, the Federal Acquisition Regulatory Council (FAR Council) '\
    'created a new clause for agencies to incorporate into their '\
    'contracts requiring prime contractors to accelerate payments to '\
    'their small business subcontractors when they receive accelerated '\
    'payments from the government. The FAR Council is also considering '\
    'strategies that might be used over the longer term to help maintain '\
    'effective cash flow and prompt payment to small business '\
    'subcontractors. '
    assert result["children"][5]["content"][0]["text"] == first_para
