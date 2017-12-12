from pathlib import Path

from ombpdf.semhtml import to_html
from .snapshot import assert_snapshot_matches


MY_DIR = Path(__file__).parent


def test_to_html_works(m_16_19_doc):
    html = to_html(m_16_19_doc)

    expected_html_path = MY_DIR / 'test_semhtml.snapshot.html'
    assert_snapshot_matches(expected_html_path, html, 'semantic HTML')
