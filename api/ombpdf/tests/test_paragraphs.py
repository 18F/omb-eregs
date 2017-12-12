import pytest

from ombpdf import paragraphs

from . import bbox


def test_annotate_paragraphs_works(m_16_19_doc):
    p = paragraphs.annotate_paragraphs(m_16_19_doc)

    assert str(p[1][0]).startswith('In 2010, the Office')
    assert str(p[2][0]).startswith('In December 2014, the')

    # The first sentence on page 2 (a new paragraph)
    assert str(p[4][0]).startswith('This memorandum defines')

    # The last sentence on page 2 (an unfinished paragraph)
    assert str(p[9][1]).strip().endswith('an existing data center')

    # The first sentence on page 3 (continuation of paragraph from page 2)
    assert str(p[9][2]).strip().startswith('without approval from OMB')


def test_annotate_paragraphs_works_with_indents(m_15_17_doc):
    p = paragraphs.annotate_paragraphs(m_15_17_doc)

    assert str(p[2][0]).startswith('Last summer, the President')

    assert str(p[3][0]).startswith('Federal government funding for')

    assert str(p[4][0]).startswith('This memorandum outlines')

    assert str(p[5][0]).startswith('While the Administration')

    assert str(p[6][0]).startswith('Native children are far')


@pytest.mark.xfail(raises=AssertionError)
def test_indents_2():
    doc, _, lines = bbox.find_lines('http://localhost:5000/rawlayout/2011/m11-29.pdf?bbox=1,61,240.5,546,313.5#1')  # NOQA
    doc.annotators.require('paragraphs')
    for line in lines:
        assert isinstance(line.annotation, paragraphs.OMBParagraph)
