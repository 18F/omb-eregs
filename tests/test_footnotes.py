from ombpdf import footnotes, lists, pagenumbers


def test_annotate_citations_works(m_16_19_doc):
    citations = footnotes.annotate_citations(m_16_19_doc)
    assert citations[:3] == [
        (1, 'shift IT investments to more efficient computing '
            'platforms and technologies.'),
        (2, 'Acquisition Reform Act (FITARA),'),
        (3, '(OFCIO)'),
    ]


def test_annotate_footnotes_works(m_16_19_doc):
    # Page numbers and footnotes can clash; handle page numbers first.
    pagenumbers.annotate_page_numbers(m_16_19_doc)
    notes = footnotes.annotate_footnotes(m_16_19_doc)
    assert notes[:1] == [
        (1, 'The FDCCI was first established by OMB “Memo for CIOs: '
            'Federal Data Center Consolidation Initiative,” issued '
            'on February 26, 2010, and modified by subsequent memoranda. '),
    ]


def test_main_works(m_16_19_doc):
    footnotes.main(m_16_19_doc)


def test_main_15_17(m_15_17_doc):
    footnotes.main(m_15_17_doc)


def test_annotate_footnotes_m_15_17(m_15_17_doc):
    # Page numbers and footnotes can clash; handle page numbers first.
    pagenumbers.annotate_page_numbers(m_15_17_doc)
    notes = footnotes.annotate_footnotes(m_15_17_doc)
    # Run this to check that there isn't a clash over lists:
    lists.annotate_lists(m_15_17_doc)

    assert notes[:2] == [
        (
            1,
            'See U.S. Department of Education, National Center for '
            'Education Statistics. Public High School Graduation Rates. '
            'https://nces.ed.gov/programs/coe/indicator coi.asp. \n'
        ),
        (
            2,
            'See U.S. Department of Education, National Center for '
            'Education Statistics. Public High School Four-Year On-Time '
            'Graduation Rates and Event Dropout Rates: School Years '
            '2010-11 and 2011-12, by Marie C. Stetser and Robert '
            '\nStillwell, NCES 2014-39 (2014). '
            'http://nces.ed.gov/pubs2014/201439l.pdf. \n'
        )
    ]


def test_annotate_footnotes_m_17_11_0(m_17_11_0_doc):
    # Page numbers and footnotes can clash; handle page numbers first.
    pagenumbers.annotate_page_numbers(m_17_11_0_doc)
    notes = footnotes.annotate_footnotes(m_17_11_0_doc)
    citations = footnotes.annotate_citations(m_17_11_0_doc)
    # Run this to check that there isn't a clash over lists:
    lists.annotate_lists(m_17_11_0_doc)

    # We're testing this footnote specifically because the source line for this
    # footnote citation contains text that's slightly smaller than most of the
    # text in the document, which was previously throwing off detection of this
    # footnote citation.
    assert notes[5] == (
        6,
        'Id. at§ 5(a). '
    )

    assert citations[5] == (
        6,
        'living adjustment. "'
    )
