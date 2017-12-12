import pytest

from ombpdf import pagenumbers

from . import bbox


def test_annotate_page_numbers_works(m_16_19_doc):
    lines = [
        str(line).strip()
        for line in pagenumbers.annotate_page_numbers(m_16_19_doc)
    ]
    assert lines == ['1', '2', '3', '5', '6', '7', '8', '10', '11']


@pytest.mark.xfail(raises=AssertionError,
                   reason="https://github.com/18F/omb-pdf/issues/1")
def test_page_numbers_with_weird_line_ordering_are_recognized():
    doc, _, line = bbox.find_line('http://localhost:5000/rawlayout/2016/m_16_19_1.pdf?bbox=4,515,16.9375,559,93.9375#4')  # NOQA

    doc.annotators.require('page_numbers')
    assert line.annotation == pagenumbers.OMBPageNumber(4)


def test_main_works(m_16_19_doc):
    pagenumbers.main(m_16_19_doc)
