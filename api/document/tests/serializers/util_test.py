import pytest
from rest_framework.exceptions import ValidationError

from document.serializers import util


@pytest.mark.parametrize('data', [{}, None, 1, "blah"])
def test_add_sourceline_to_errors_ignores_data_without_sourceline(data):
    with pytest.raises(ValidationError) as excinfo:
        with util.add_sourceline_to_errors(data):
            raise ValidationError({'blah': 'hmm'})
    assert excinfo.value.detail == {'blah': 'hmm'}


@pytest.mark.parametrize('detail', [(), [], None, 1, "blah"])
def test_add_sourceline_to_errors_ignores_err_without_detail_dict(detail):
    with pytest.raises(ValidationError):
        with util.add_sourceline_to_errors({'_sourceline': 1}):
            raise ValidationError(detail)


def test_add_sourceline_to_errors_adds_sourceline_to_err():
    with pytest.raises(ValidationError) as excinfo:
        with util.add_sourceline_to_errors({'_sourceline': 1}):
            raise ValidationError({'a': 'b'})
    assert excinfo.value.detail == {'a': 'b', '_sourceline': 1}


def test_add_sourceline_to_errors_does_not_overwrite_sourceline():
    with pytest.raises(ValidationError) as excinfo:
        with util.add_sourceline_to_errors({'_sourceline': 50}):
            raise ValidationError({'a': 'b', '_sourceline': 'meh'})
    assert excinfo.value.detail == {'a': 'b', '_sourceline': 'meh'}
