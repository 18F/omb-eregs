from decimal import Decimal

import pytest

from . import fontsize
from . import util
from . import footnotes
from . import document
from .download_pdfs import download


pages_cache = {}


def read_pages(relpath):
    if relpath not in pages_cache:
        with download(relpath).open('rb') as fp:
            pages_cache[relpath] = util.get_ltpages(fp)
    return pages_cache[relpath]


@pytest.fixture
def m_16_19_pages():
    return read_pages('2016/m_16_19_1.pdf')


def test_get_font_size_stats_works(m_16_19_pages):
    stats = fontsize.get_font_size_stats(m_16_19_pages)
    assert stats.most_common(1) == [
        (('TimesNewRomanPSMT', Decimal('16.2')), 21557),
    ]


def test_fontsize_main_works(m_16_19_pages):
    fontsize.main(m_16_19_pages)


def test_footnotes_find_citations_works(m_16_19_pages):
    doc = document.OMBDocument(m_16_19_pages)
    citations = footnotes.find_citations(doc)
    assert citations[:3] == [
        (1, 'shift IT investments to more efficient computing '
            'platforms and technologies.'),
        (2, 'Acquisition Reform Act (FITARA),'),
        (3, '(OFCIO)'),
    ]


def test_footnotes_find_footnotes_works(m_16_19_pages):
    doc = document.OMBDocument(m_16_19_pages)
    notes = footnotes.find_footnotes(doc)
    assert notes[:1] == [
        (1, 'The FDCCI was first established by OMB “Memo for CIOs: '
            'Federal Data Center Consolidation Initiative,” issued '
            'on February 26, 2010, and modified by subsequent memoranda. '),
    ]
