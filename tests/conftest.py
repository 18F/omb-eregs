import pytest

from ombpdf.download_pdfs import download
from ombpdf import util, document


pages_cache = {}


def read_pages(relpath):
    if relpath not in pages_cache:
        with download(relpath).open('rb') as fp:
            pages_cache[relpath] = util.get_ltpages(fp)
    return pages_cache[relpath]


@pytest.fixture
def m_16_19_pages():
    return read_pages('2016/m_16_19_1.pdf')


@pytest.fixture
def m_16_19_doc(m_16_19_pages):
    return document.OMBDocument(m_16_19_pages, filename='m_16_19_1.pdf')
