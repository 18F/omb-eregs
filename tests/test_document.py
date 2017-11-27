def test_textline_repr_works(m_16_19_doc):
    assert repr(m_16_19_doc.pages[0][4]) == \
        '<OMBTextLine with text "August 1, 2016 ">'
