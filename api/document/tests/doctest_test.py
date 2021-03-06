import doctest
from importlib import import_module

import pytest


@pytest.mark.parametrize('module_name', [
    'document.tree',
])
def test_doctests(module_name):
    _, test_count = doctest.testmod(
        import_module(module_name),
        report=True,
        verbose=True,
        raise_on_error=True,
        optionflags=doctest.NORMALIZE_WHITESPACE,
    )
    assert test_count > 0
