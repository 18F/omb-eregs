from ombpdf import rawlayout


def test_to_html_works(m_16_19_doc):
    html = rawlayout.to_html(m_16_19_doc)

    assert 'Raw layout' in html
    assert 'left:' in html
    assert 'width:' in html
