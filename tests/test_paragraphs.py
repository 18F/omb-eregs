from ombpdf import paragraphs, pagenumbers, footnotes


def test_annotate_paragraphs_works(m_16_19_doc):
    pagenumbers.annotate_page_numbers(m_16_19_doc)
    footnotes.annotate_footnotes(m_16_19_doc)
    p = paragraphs.annotate_paragraphs(m_16_19_doc)

    assert str(p[1][0]).startswith('In 2010, the Office')
    assert str(p[2][0]).startswith('In December 2014, the')

    # The first sentence on page 2 (a new paragraph)
    assert str(p[4][0]).startswith('This memorandum defines')

    # The last sentence on page 2 (an unfinished paragraph)
    assert str(p[9][1]).strip().endswith('an existing data center')

    # The first sentence on page 3 (continuation of paragraph from page 2)
    assert str(p[9][2]).strip().startswith('without approval from OMB')
