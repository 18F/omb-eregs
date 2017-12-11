from ombpdf import underlines


def underlines_in_page(page):
    return [
        ''.join([str(c) for c in chars]) for chars in
        underlines.set_underlines_in_page(page)
    ]


def test_set_underlines_in_page_works(m_16_19_doc):
    assert underlines_in_page(m_16_19_doc.pages[0]) == ['Background']
    assert underlines_in_page(m_16_19_doc.pages[1]) == [
        'Policy',
        'Leadership and Responsibilities',
        'Transition to Cloud and Data Center Shared Services',
        ('https://www.whitehouse.gov/sites/default/files/omb/assets'
         '/egov_docs/shared_services_strategy.pdf'),
        ('https://www.whitehouse.gov/sites/default/files/omb/memoranda'
         '/2015/m-15-14.pdf'),
    ]


def test_main_works(m_16_19_doc):
    underlines.main(m_16_19_doc)
