import re
from pathlib import Path
import difflib

from ombpdf.html import to_html


MY_DIR = Path(__file__).parent


def test_to_html_works(m_16_19_doc):
    html = to_html(m_16_19_doc)

    expected_html_path = MY_DIR / 'test_html.snapshot.html'
    expected_html_path = expected_html_path.relative_to(Path('.').resolve())

    if not expected_html_path.exists():
        expected_html_path.write_text(html, encoding='utf-8')

    expected_html = expected_html_path.read_text(encoding='utf-8')

    if expected_html != html:
        print(''.join(difflib.unified_diff(
            html.splitlines(),
            expected_html.splitlines(),
            fromfile=str(expected_html_path),
            tofile='Current HTML output',
        )))
        raise AssertionError(
            'Current HTML output does not match snapshot. If '
            'you want to bless the current output as the new snapshot, '
            f'please delete {expected_html_path} and re-run this test.'
            "You'll also want to commit the updated snapshot to git."
        )

    assert 'href="#footnote-1' in html
    assert 'id="footnote-1"' in html
    assert 'title="Footnote 1"' in html

    assert re.search(r'class="[a-z\- ]*bold', html)
    assert re.search(r'class="[a-z\- ]*underline', html)
    assert re.search(r'class="[a-z\- ]*footnote-citation', html)
    assert re.search(r'class="[a-z\- ]*sans-serif', html)
    assert re.search(r'class="[a-z\- ]*italic', html)
