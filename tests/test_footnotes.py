from ombpdf import footnotes


def test_annotate_citations_works(m_16_19_doc):
    citations = footnotes.annotate_citations(m_16_19_doc)
    assert citations[:3] == [
        (1, 'shift IT investments to more efficient computing '
            'platforms and technologies.'),
        (2, 'Acquisition Reform Act (FITARA),'),
        (3, '(OFCIO)'),
    ]


def test_annotate_footnotes_works(m_16_19_doc):
    notes = footnotes.annotate_footnotes(m_16_19_doc)
    assert notes[:1] == [
        (1, 'The FDCCI was first established by OMB “Memo for CIOs: '
            'Federal Data Center Consolidation Initiative,” issued '
            'on February 26, 2010, and modified by subsequent memoranda. '),
    ]


def test_main_works(m_16_19_doc):
    footnotes.main(m_16_19_doc)
