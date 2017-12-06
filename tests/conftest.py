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


@pytest.fixture
def m_15_16_pages():
    return read_pages('2015/m-15-16.pdf')


@pytest.fixture
def m_15_16_doc(m_15_16_pages):
    return document.OMBDocument(m_15_16_pages, filename='m-15-16.pdf')


@pytest.fixture
def m_15_17_pages():
    return read_pages('2015/m-15-17.pdf')


@pytest.fixture
def m_15_17_doc(m_15_17_pages):
    return document.OMBDocument(m_15_17_pages, filename='m-15-17.pdf')


@pytest.fixture
def m_17_11_0_pages():
    return read_pages('2017/m-17-11_0.pdf')


@pytest.fixture
def m_17_11_0_doc(m_17_11_0_pages):
    return document.OMBDocument(m_17_11_0_pages, filename='m-17-11_0.pdf')
