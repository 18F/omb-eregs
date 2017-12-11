from decimal import Decimal

from ombpdf import fontsize


def test_get_font_size_stats_works(m_16_19_pages):
    stats = fontsize.get_font_size_stats(m_16_19_pages)
    assert stats.most_common(1) == [
        (('TimesNewRomanPSMT', Decimal('16.2')), 21557),
    ]


def test_main_works(m_16_19_pages):
    fontsize.main(m_16_19_pages)
