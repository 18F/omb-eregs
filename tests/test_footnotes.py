from ombpdf import footnotes, lists, pagenumbers


def tuplify(iterable):
    return [tuple(x) for x in iterable]


def test_annotate_citations_works(m_16_19_doc):
    citations = tuplify(footnotes.annotate_citations(m_16_19_doc))
    assert citations[:3] == [
        (1, 'shift IT investments to more efficient computing '
            'platforms and technologies.'),
        (2, 'Acquisition Reform Act (FITARA),'),
        (3, '(OFCIO)'),
    ]


def test_annotate_footnotes_works(m_16_19_doc):
    # Page numbers and footnotes can clash; handle page numbers first.
    pagenumbers.annotate_page_numbers(m_16_19_doc)
    notes = tuplify(footnotes.annotate_footnotes(m_16_19_doc))
    assert notes[:1] == [
        (1, 'The FDCCI was first established by OMB “Memo for CIOs: '
            'Federal Data Center Consolidation Initiative,” issued '
            'on February 26, 2010, and modified by subsequent memoranda.'),
    ]
    # This is to test that we don't annotate small text as footnotes unless
    # that text is in the bottom third of the page--we know that "Total Server
    # Count" is small text in the middle of a page in M-16-19 and that it
    # would show up as part of footnote 26 if we didn't guard against that:
    assert "Total Server Count" not in notes[25][1]


def test_main_works(m_16_19_doc):
    footnotes.main(m_16_19_doc)


def test_main_15_17(m_15_17_doc):
    footnotes.main(m_15_17_doc)


def test_annotate_footnotes_m_15_17(m_15_17_doc):
    # Page numbers and footnotes can clash; handle page numbers first.
    pagenumbers.annotate_page_numbers(m_15_17_doc)
    notes = tuplify(footnotes.annotate_footnotes(m_15_17_doc))
    # Run this to check that there isn't a clash over lists:
    lists.annotate_lists(m_15_17_doc)

    expected = [
        (
            1,
            'See U.S. Department of Education, National Center for '
            'Education Statistics. Public High School Graduation Rates. '
            'https://nces.ed.gov/programs/coe/indicator coi.asp.'
        ),
        (
            2,
            'See U.S. Department of Education, National Center for '
            'Education Statistics. Public High School Four-Year On-Time '
            'Graduation Rates and Event Dropout Rates: School Years '
            '2010-11 and 2011-12, by Marie C. Stetser and Robert '
            '\nStillwell, NCES 2014-39 (2014). '
            'http://nces.ed.gov/pubs2014/201439l.pdf.'
        ),
        (
            3,
            'U.S. Department of Health and Human Services, Administration for '
            'Substance Abuse and Mental Health Services. Administrator Pamela '
            'Hyde, "Behavioral Health and Tribal Communities." Presentation '
            'at the National Indian \nEducation Association\'s 141h Annual '
            'Legislative Summit, Washington, D.C., February 8, 2011. '
            '\nhttp://www.store.samhsa.gov/shin/content/SMA ll-PHYDE020811 '
            '/SMA ll-PHYDE0208ll.pdf.'
        ),
        (
            4,
            'U.S. Department of Health and Human Services, Administration '
            'for Substance Abuse and Mental Health Services. Spero M. '
            'Manson, "Culturally Appropriate Strategies for Prevention-Based '
            'Work in Tribal Communities." Presentation \n'
            'for the Enhancing State Prevention Systems for Children & Youth: '
            'National Webinar Series, August 21 , 2013 . \n'
            'http://www.nasmhpd.org/docs/Webinars%20ppts/'
            'Culturally%20Appreopriate Tribal%20webinar%2008.21.20 13 .pdf.'
        ),
        (
            5,
            "U.S. Department of Education, Office of Special Education "
            "Programs, My Brother 's Keeper Task Force Report to the "
            "President (20 14). "
            "http://www. whitehouse.gov/sites/default/files/docs/053014 mbk "
            "report. pdf."
        ),
        (
            6,
            'U.S. Department of Health and Human Services, Center for '
            'Behavioral Health Statistics and Quality, National Survey on '
            'Drug Use and Health, ICPSR 34933 (2012). '
            'http://doi.org/10.3886/ICPSR34933.v2.'
        ),
        (
            7,
            '"[F]ederal promotion of tribal self-government under formal '
            'policies known as \'self-determination\' is turning out to be, '
            'after a century or more of failed efforts to improve the lives '
            'ofthe U.S. indigenous people, the only strategy that has \n'
            'worked." Stephen Cornell and Joseph P. Kalt, American Indian '
            'Self-Determination: The Political Economy ofa Policy \nthat '
            'Works. Working Paper No. RWPI0-043, at 15. Harvard Kennedy '
            'School of Government, 2010. \n'
            'http:/ /nrs.harvard.edu/um-3: HUL.InstRepos:4553 307.'
        )
    ]

    for i, note in enumerate(expected):
        assert note == notes[i]


def test_annotate_footnotes_m_17_11_0(m_17_11_0_doc):
    # Page numbers and footnotes can clash; handle page numbers first.
    pagenumbers.annotate_page_numbers(m_17_11_0_doc)
    notes = tuplify(footnotes.annotate_footnotes(m_17_11_0_doc))
    citations = tuplify(footnotes.annotate_citations(m_17_11_0_doc))
    # Run this to check that there isn't a clash over lists:
    lists.annotate_lists(m_17_11_0_doc)

    # We're testing this footnote specifically because the source line for this
    # footnote citation contains text that's slightly smaller than most of the
    # text in the document, which was previously throwing off detection of this
    # footnote citation.
    assert notes[5] == (
        6,
        'Id. at§ 5(a).'
    )

    assert citations[5] == (
        6,
        'living adjustment. "'
    )
