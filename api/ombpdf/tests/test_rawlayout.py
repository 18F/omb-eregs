from ombpdf import rawlayout


def test_to_html_works(m_16_19_doc):
    html, ctx = rawlayout.to_html(m_16_19_doc)

    assert 'left:' in html
    assert 'width:' in html
    assert 'legend' in ctx
    assert ('OMBFootnote', 'line-OMBFootnote') in ctx['legend']
