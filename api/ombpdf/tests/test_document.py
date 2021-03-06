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


def test_calc_left_edge(monkeypatch):
    monkeypatch.setattr(document, 'logger', Mock())

    lines = [
        Mock(left_edge=10),
        Mock(left_edge=20),
        Mock(left_edge=10),
        Mock(left_edge=20),
        Mock(left_edge=30),
        Mock(left_edge=10),
    ]
    assert document.calc_left_edge(lines) == 10
    assert not document.logger.warning.called


def test_no_significant_left_edge(monkeypatch):
    monkeypatch.setattr(document, 'logger', Mock())

    lines = [Mock(left_edge=i*10) for i in range(1, 20)]
    assert document.calc_left_edge(lines) == 10
    assert document.logger.warning.called


def test_no_left_edge(monkeypatch):
    monkeypatch.setattr(document, 'logger', Mock())

    assert document.calc_left_edge([]) == 0
    assert document.logger.warning.called


def test_image_pdf(monkeypatch):
    monkeypatch.setattr(document, 'logger', Mock())
    mock_page = []

    doc = document.OMBDocument([mock_page, mock_page, mock_page])
    assert doc.paragraph_fontsize == 0
    assert document.logger.warning.called
