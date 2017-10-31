from unittest.mock import Mock
from model_mommy import mommy
import pytest

from reqs import models


def test_policy_title_with_number():
    """title_with_number field should include omb_policy_id if present"""
    policy = models.Policy(title="Some Title")
    assert policy.title_with_number == "Some Title"

    policy.omb_policy_id = "A123"
    assert policy.title_with_number == "A123: Some Title"


def test_policy_str():
    """Should trim the policy title and add the policy number"""
    policy = models.Policy(policy_number=5, title="Short", omb_policy_id="ID")
    assert str(policy) == "(5) ID: Short"

    policy.title = "Long"*100
    assert str(policy) == "(5) ID: {0}...".format("Long"*24)


def test_original_url():
    """Should display document_source, if present"""
    policy = models.Policy(uri='http://example.com/original')
    assert policy.original_url == 'http://example.com/original'

    policy.document_source = Mock(url='http://example.com/uploaded')
    assert policy.original_url == 'http://example.com/uploaded'


@pytest.mark.django_db
def test_slug_is_created_from_title_on_save_if_slug_is_empty():
    policy = mommy.make(models.Policy)
    policy.title = 'hello there'
    policy.slug = ''
    policy.save()
    assert policy.slug == 'hello-there'
