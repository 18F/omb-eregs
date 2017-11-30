import re
from pathlib import Path
import difflib

from ombpdf.semhtml import to_html


MY_DIR = Path(__file__).parent


def test_to_html_works(m_16_19_doc):
    html = to_html(m_16_19_doc)

    expected_html_path = MY_DIR / 'test_semhtml.snapshot.html'
    expected_html_path = expected_html_path.relative_to(Path('.').resolve())

    if not expected_html_path.exists():
        expected_html_path.write_text(html, encoding='utf-8')

    expected_html = expected_html_path.read_text(encoding='utf-8')

    if expected_html != html:
        print('\n'.join(difflib.unified_diff(
            expected_html.splitlines(),
            html.splitlines(),
            tofile=f'Current HTML output',
            fromfile=str(expected_html_path),
        )))
        raise AssertionError(
            'Current HTML output does not match snapshot. If '
            'you want to bless the current output as the new snapshot, '
            f'please delete {expected_html_path} and re-run this test.'
            "You'll also want to commit the updated snapshot to git."
        )
