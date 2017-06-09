import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Policy, Requirement


@pytest.mark.django_db
def test_excludes_nonpublic():
    """The API endpoint should not include policies flagged as nonpublic"""
    public_policy = mommy.make(Policy, policy_number='0')
    nonpublic_policy = mommy.make(Policy, policy_number='1', nonpublic=True)
    assert public_policy.nonpublic is False  # The default should be False.
    public_reqs = mommy.make(Requirement, policy=public_policy, _quantity=3)
    nonpublic_reqs = mommy.make(Requirement,
                                policy=nonpublic_policy, _quantity=4)
    client = APIClient()

    path = "/policies/"
    response = client.get(path).json()
    assert response['count'] == 1

    public_path = "/policies/?id={0}".format(public_policy.id)
    public_response = client.get(public_path).json()
    assert public_response['count'] == 1

    nonpublic_path = "/policies/?id={0}".format(nonpublic_policy.id)
    nonpublic_response = client.get(nonpublic_path).json()
    assert nonpublic_response['count'] == 0

    req_path = "/requirements/"
    req_response = client.get(req_path).json()
    assert req_response['count'] == 3

    for req in public_reqs:
        id_path = "/requirements/?req_id=" + req.req_id
        id_response = client.get(id_path).json()
        assert id_response['count'] == 1

    for req in nonpublic_reqs:
        id_nonpublic_path = "/requirements/?req_id=" + req.req_id
        id_nonpublic_response = client.get(id_nonpublic_path).json()
        assert id_nonpublic_response['count'] == 0
