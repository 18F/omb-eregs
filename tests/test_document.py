def test_textline_repr_works(m_16_19_doc):
    assert repr(m_16_19_doc.pages[0][4]) == \
        '<OMBTextLine with text "August 1, 2016 ">'


def test_textline_is_blank_works(m_16_19_doc):
    assert m_16_19_doc.pages[0][0].is_blank()
    assert not m_16_19_doc.pages[0][4].is_blank()


def test_page_numbers_work(m_16_19_doc):
    assert m_16_19_doc.pages[0].number == 1
    assert m_16_19_doc.pages[1].number == 2
