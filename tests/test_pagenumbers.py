from ombpdf import pagenumbers


def test_annotate_page_numbers_works(m_16_19_doc):
    lines = [
        str(line).strip()
        for line in pagenumbers.annotate_page_numbers(m_16_19_doc)
    ]
    assert lines == ['1', '2', '3', '5', '6', '7', '8', '10', '11']


def test_main_works(m_16_19_doc):
    pagenumbers.main(m_16_19_doc)
