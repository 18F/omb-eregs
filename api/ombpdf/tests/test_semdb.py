from datetime import date
from unittest.mock import Mock

import pytest
from model_mommy import mommy

from ombpdf import semdb, semtree
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


def test_heading():
    writer = semdb.DatabaseWriter(mommy.prepare(Policy))
    elements = [
        semtree.Heading(1),
        semtree.Heading(3),     # skips a level
        semtree.Heading(1),
        semtree.Heading(2),
    ]
    for element in elements:
        writer.begin_element(element)
        writer.end_element(element)
    writer.end_document(semtree.Document(''))
    result = [n.identifier for n in writer.cursor.walk()]
    assert result == [
        'policy_1',
        'policy_1__sec_1',
        'policy_1__sec_1__heading_1',
        'policy_1__sec_1__sec_1',
        'policy_1__sec_1__sec_1__sec_1',
        'policy_1__sec_1__sec_1__sec_1__heading_1',
        'policy_1__sec_2',
        'policy_1__sec_2__heading_1',
        'policy_1__sec_2__sec_1',
        'policy_1__sec_2__sec_1__heading_1',
    ]


def test_lists():
    writer = semdb.DatabaseWriter(mommy.prepare(Policy))
    outer = semtree.List(is_ordered=True)
    inner = semtree.List(is_ordered=False)
    item1, item2, item3 = (semtree.ListItem() for _ in range(3))
    bullet1, bullet2 = (semtree.ListItem() for _ in range(2))

    writer.begin_list(outer)
    writer.begin_list_item(item1)
    writer.end_list_item(item1)
    writer.begin_list_item(item2)
    writer.end_list_item(item2)
    writer.begin_list(inner)
    writer.begin_list_item(bullet1)
    writer.end_list_item(bullet1)
    writer.begin_list_item(bullet2)
    writer.end_list_item(bullet2)
    writer.end_list(inner)
    writer.begin_list_item(item3)
    writer.end_list_item(item3)
    writer.end_document(semtree.Document(''))

    result = [n.identifier for n in writer.cursor.walk()]
    assert result == [
        'policy_1',
        'policy_1__list_1',
        'policy_1__list_1__listitem_1',
        'policy_1__list_1__listitem_1__para_1',
        'policy_1__list_1__listitem_2',
        'policy_1__list_1__listitem_2__para_1',
        'policy_1__list_1__list_1',
        'policy_1__list_1__list_1__listitem_1',
        'policy_1__list_1__list_1__listitem_1__para_1',
        'policy_1__list_1__list_1__listitem_2',
        'policy_1__list_1__list_1__listitem_2__para_1',
        'policy_1__list_1__listitem_3',
        'policy_1__list_1__listitem_3__para_1',
    ]

    assert writer.cursor['list_1']['listitem_1'].marker == '1.'
    assert writer.cursor['list_1']['list_1']['listitem_1'].marker == '\u2022'


def test_footnotes():
    writer = semdb.DatabaseWriter(mommy.prepare(Policy))
    paras = [semtree.Paragraph() for _ in range(2)]
    footnote_list = semtree.FootnoteList()
    footnotes = [semtree.Footnote(i + 1) for i in range(3)]

    writer.begin_paragraph(paras[0])
    writer.create_text('Some stuff')
    writer.create_footnote_citation(semtree.FootnoteCitation(1))
    writer.create_text(' then2 more stuff')     # misparsed the second citation
    writer.create_footnote_citation(semtree.FootnoteCitation(3))
    writer.end_paragraph(paras[0])
    writer.begin_paragraph(paras[1])
    writer.end_paragraph(paras[1])
    writer.begin_footnote_list(footnote_list)
    for footnote in footnotes:
        writer.begin_footnote(footnote)
        writer.end_footnote(footnote)
    writer.end_footnote_list(footnote_list)
    writer.end_document(semtree.Document(''))

    result = [n.identifier for n in writer.cursor.walk()]
    assert result == [
        'policy_1',
        'policy_1__para_1',
        'policy_1__para_1__footnote_1',
        'policy_1__para_1__footnote_3',
        'policy_1__para_2',
        'policy_1__footnote_2',
    ]

    assert writer.cursor['para_1'].text == 'Some stuff1 then2 more stuff3'
    assert writer.footnote_citations[1].start == len('Some stuff')
    assert writer.footnote_citations[1].end == len('Some stuff1')
    assert 2 not in writer.footnote_citations


def test_footnotes_citation_without_footnote(monkeypatch):
    monkeypatch.setattr(semdb, 'logger', Mock())

    writer = semdb.DatabaseWriter(mommy.prepare(Policy))
    para = semtree.Paragraph()
    footnote_list = semtree.FootnoteList()

    writer.begin_paragraph(para)
    writer.create_text('This has a citation')
    writer.create_footnote_citation(semtree.FootnoteCitation(1))
    writer.create_text(' but no footnote')
    writer.end_paragraph(para)
    writer.begin_footnote_list(footnote_list)
    assert 1 in writer.footnote_citations
    writer.end_footnote_list(footnote_list)
    assert semdb.logger.warning.called
