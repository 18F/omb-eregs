import pytest
from model_mommy import mommy

from document.management.commands import import_xml_doc
from reqs.models import Policy


@pytest.mark.django_db
def test_fetch_policy_pk():
    policy = mommy.make(Policy)
    assert import_xml_doc.fetch_policy(f"{policy.pk}") == policy


@pytest.mark.django_db
def test_fetch_policy_number():
    policy = mommy.make(Policy, omb_policy_id='M-12-13')
    assert import_xml_doc.fetch_policy('M-12-13') == policy
