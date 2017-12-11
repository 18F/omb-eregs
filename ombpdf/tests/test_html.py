import re
from pathlib import Path

from ombpdf.html import to_html
from .snapshot import assert_snapshot_matches


MY_DIR = Path(__file__).parent


def test_to_html_works(m_16_19_doc):
    html = to_html(m_16_19_doc)

    assert_snapshot_matches(MY_DIR / 'test_html.snapshot.html', html, 'HTML')

    assert 'href="#footnote-1' in html
    assert 'id="footnote-1"' in html
    assert 'title="Footnote 1"' in html

    assert re.search(r'class="[a-z\- ]*bold', html)
    assert re.search(r'class="[a-z\- ]*underline', html)
    assert re.search(r'class="[a-z\- ]*footnote-citation', html)
    assert re.search(r'class="[a-z\- ]*sans-serif', html)
    assert re.search(r'class="[a-z\- ]*italic', html)
