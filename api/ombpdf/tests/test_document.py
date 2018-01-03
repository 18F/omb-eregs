from unittest.mock import Mock

from ombpdf import document


def test_textline_repr_works(m_16_19_doc):
    assert repr(m_16_19_doc.pages[0][4]) == \
        '<OMBTextLine with text "August 1, 2016 ">'


def test_textline_is_blank_works(m_16_19_doc):
    assert m_16_19_doc.pages[0][0].is_blank()
    assert not m_16_19_doc.pages[0][4].is_blank()


def test_page_numbers_work(m_16_19_doc):
    assert m_16_19_doc.pages[0].number == 1
    assert m_16_19_doc.pages[1].number == 2


def test_useful_lines_are_not_culled(m_11_29_doc):
    lastpage_text = '\n'.join([str(line) for line in m_11_29_doc.pages[-1]])

    assert 'opportunities to reduce duplication' in lastpage_text


def test_calc_left_edge():
    lines = [
        Mock(left_edge=10),
        Mock(left_edge=20),
        Mock(left_edge=10),
        Mock(left_edge=20),
        Mock(left_edge=30),
        Mock(left_edge=10),
    ]
    assert document.calc_left_edge(lines) == 10
