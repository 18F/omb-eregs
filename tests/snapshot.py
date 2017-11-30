import difflib
from pathlib import Path


def assert_snapshot_matches(snapshot_path, content, name=''):
    snapshot_path = snapshot_path.relative_to(Path('.').resolve())

    if not snapshot_path.exists():
        snapshot_path.write_text(content, encoding='utf-8')

    expected_content = snapshot_path.read_text(encoding='utf-8')

    if expected_content != content:
        print('\n'.join(difflib.unified_diff(
            expected_content.splitlines(),
            content.splitlines(),
            tofile=f'Current {name} output',
            fromfile=str(snapshot_path),
        )))
        raise AssertionError(
            f'Current {name} output does not match snapshot. If '
            f'you want to bless the current output as the new snapshot, '
            f'please delete {snapshot_path} and re-run this test. '
            f"You'll also want to commit the updated snapshot to git."
        )
