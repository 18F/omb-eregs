import difflib
from pathlib import Path


def assert_snapshot_matches(snapshot_path: Path, content: str, name='',
                            force_overwrite=False):
    '''
    Assert that the content of the snapshot at the given path, if it
    exists, matches the given content.

    If the path doesn't exist, it is created with the passed-in content,
    thus establishing a new snapshot.

    If `force_overwrite` is True, a new snapshot is created regardless
    of whether the passed-in content matches the current snapshot's
    content (and no exception is raised if there is a mismatch between
    them).
    '''

    snapshot_path = snapshot_path.relative_to(Path('.').resolve())

    if not snapshot_path.exists() or force_overwrite:
        # Encoding the content ourselves and using write_bytes will
        # ensure that the files have unix line endings.
        snapshot_path.write_bytes(content.encode('utf-8'))

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
