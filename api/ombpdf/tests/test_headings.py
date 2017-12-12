from decimal import Decimal

from ombpdf.fontsize import FontSize, FontName
from ombpdf import headings
from ombpdf.headings import Style


def test_style_repr_works():
    s = Style(False, 'blah')
    assert repr(s) == 'Style(is_underlined=False, fontsize=blah)'


def test_style_ordering_works():
    h1 = Style(False, FontSize(FontName('times bold'), Decimal('16')))
    h2 = Style(True, FontSize(FontName('times bold'), Decimal('14')))
    h3 = Style(False, FontSize(FontName('times bold'), Decimal('14')))
    h4 = Style(False, FontSize(FontName('times'), Decimal('14')))

    styles = [h4, h3, h2, h1]
    styles.sort(reverse=True)

    assert styles == [h1, h2, h3, h4]


def test_annotate_headings_works(m_16_19_doc):
    h = [
        (line.annotation.level, str(line).strip())
        for line in headings.annotate_headings(m_16_19_doc)
    ]

    assert (1, 'Background') in h
    assert (2, 'Transition to Cloud and Data Center Shared Services') in h
    assert (3, 'Development Freeze for New and Current Data Centers') in h

    for _, text in h:
        # There's a paragraph that starts with an underlined hyperlink
        # at the very end of M-16-19; we want to make sure it's not
        # mis-classified as a heading.
        assert not text.startswith('https://')


def test_main_works(m_16_19_doc):
    headings.main(m_16_19_doc)


def test_annotate_headings_m_15_16(m_15_16_doc):
    """
    Minor difference in font size were causing many false positives for
    headings in this document; this test checks that only the actual headings
    are present.
    We're looking only at what's after the SUBJECT: line because that line is
    part of the metadata and should be treated differently.
    """
    split_heading = "SUBJECT: Multi-Agency Science and Technology Priorities "\
        "for the FY 2017 Budget"
    headers = [str(line).strip() for line in
               headings.annotate_headings(m_15_16_doc)]
    if split_heading in headers:
        subj_index = headers.index(split_heading)
        relevant = headers[subj_index + 1:]
    else:
        relevant = headers

    expected = [
        "Multi-Agency R&D priorities",
        "R&D Infrastructure",
        "Other R&D Program Guidance",
        "STEM Education Guidance",
    ]

    assert relevant == expected
