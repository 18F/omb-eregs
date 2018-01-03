import subprocess
from pathlib import Path

MY_DIR = Path(__file__).parent.resolve()
PKG_DIR = MY_DIR.parent


def test_mypy():
    subprocess.check_call([
        'mypy',
        str(PKG_DIR / 'import_json_doc.py'),
    ])
