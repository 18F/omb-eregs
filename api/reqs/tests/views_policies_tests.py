from collections import namedtuple

import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Agency, AgencyGroup, Policy, Requirement, Topic

PolicySetup = namedtuple('PolicySetup', ('policies', 'reqs'))


@pytest.fixture
def policy_setup():
    policies = [mommy.make(Policy, policy_number='0'),
                mommy.make(Policy, policy_number='1')]
    reqs = [mommy.make(Requirement, policy=policies[0], _quantity=3),
            mommy.make(Requirement, policy=policies[1], _quantity=4)]
    yield PolicySetup(policies, reqs)


@pytest.fixture
def policy_topic_setup(policy_setup):
    topics = mommy.make(Topic, _quantity=3)
    reqs = policy_setup.reqs
    reqs[0][0].topics.add(topics[0])
    reqs[0][1].topics.add(topics[1])
    reqs[0][2].topics.add(topics[0], topics[1])
    reqs[1][0].topics.add(topics[1])
    reqs[1][1].topics.add(topics[1], topics[2])
    yield policy_setup, topics


@pytest.mark.django_db
def test_topics_counts_no_params(policy_topic_setup):
    """The API endpoint should include all requirements when no params are
    given"""
    (_, reqs), _ = policy_topic_setup
    client = APIClient()

    response = client.get("/policies/").json()
    assert response['count'] == 2
    assert response['results'][0]['total_reqs'] == len(reqs[0])
    assert response['results'][0]['relevant_reqs'] == len(reqs[0])
    assert response['results'][1]['total_reqs'] == len(reqs[1])
    assert response['results'][1]['relevant_reqs'] == len(reqs[1])


@pytest.mark.django_db
def test_topics_counts_filter_req(policy_topic_setup):
    """The API endpoint should include only relevant policies when we filter
    by an attribute of a requirement"""
    (_, reqs), _ = policy_topic_setup
    client = APIClient()

    path = "/policies/?requirements__req_id=" + reqs[1][1].req_id
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['total_reqs'] == len(reqs[1])
    assert response['results'][0]['relevant_reqs'] == 1


@pytest.mark.django_db
def test_topics_counts_filter_by_one_topic(policy_topic_setup):
    """The API endpoint should include only relevant policies when we filter
    by a single topic"""
    (_, reqs), topics = policy_topic_setup
    client = APIClient()

    path = "/policies/?requirements__topics__id__in={0}".format(topics[0].pk)
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['total_reqs'] == len(reqs[0])
    # reqs[0][0] and reqs[0][2]
    assert response['results'][0]['relevant_reqs'] == 2


@pytest.mark.django_db
def test_topics_counts_filter_by_multiple_topics(policy_topic_setup):
    """The API endpoint should include only relevant policies when we filter
    by multiple topics"""
    (_, reqs), topics = policy_topic_setup
    client = APIClient()

    path = "/policies/?requirements__topics__id__in={0},{1}".format(
        topics[0].pk, topics[2].pk)
    response = client.get(path).json()
    assert response['count'] == 2
    assert response['results'][0]['total_reqs'] == len(reqs[0])
    # reqs[0][0] and reqs[0][2]
    assert response['results'][0]['relevant_reqs'] == 2
    assert response['results'][1]['total_reqs'] == len(reqs[1])
    # reqs[1][1]
    assert response['results'][1]['relevant_reqs'] == 1


@pytest.mark.django_db
def test_agencies_direct(policy_setup):
    _, reqs = policy_setup
    agencies = mommy.make(Agency, _quantity=3)
    reqs[0][1].agencies.add(agencies[0], agencies[1])
    reqs[1][0].agencies.add(agencies[2])
    client = APIClient()

    path = "/policies/?requirements__all_agencies__id__in={0}".format(
        agencies[0].pk)
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['relevant_reqs'] == 1

    path = "/policies/?requirements__agencies__id__in={0}".format(
        agencies[0].pk)
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['relevant_reqs'] == 1


@pytest.mark.django_db
def test_agencies_indirect(policy_setup):
    _, reqs = policy_setup
    group = mommy.make(AgencyGroup)
    agency_in_group, agency_no_group = mommy.make(Agency, _quantity=2)
    group.agencies.add(agency_in_group)
    reqs[0][0].agencies.add(agency_no_group)
    reqs[1][0].agency_groups.add(group)
    client = APIClient()

    path = "/policies/?requirements__all_agencies__id__in={0}".format(
        agency_in_group.pk)
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['relevant_reqs'] == 1

    path = "/policies/?requirements__agencies__id__in={0}".format(
        agency_in_group.pk)
    response = client.get(path).json()
    assert response['count'] == 0

    path = "/policies/?requirements__agency_groups__id__in={0}".format(
        group.pk)
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['relevant_reqs'] == 1


@pytest.mark.django_db
def test_nonpublic_reqs():
    client = APIClient()
    policy = mommy.make(Policy)
    mommy.make(Requirement, policy=policy, public=False)

    assert client.get('/policies/').json()['count'] == 0

    mommy.make(Requirement, _quantity=4, policy=policy)
    response = client.get('/policies/').json()
    assert response['count'] == 1
    assert policy.requirements.count() == 5
    assert response['results'][0]['relevant_reqs'] == 4
    assert response['results'][0]['total_reqs'] == 4


@pytest.mark.django_db
def test_omb_policy_id():
    client = APIClient()
    omb_policy_id = "M-123-4"
    path = "/policies/{0}".format(omb_policy_id)
    response = client.get(path)
    assert response.status_code == 301
    mommy.make(Policy, omb_policy_id=omb_policy_id)
    response = client.get(path + '.json').json()
    assert response['omb_policy_id'] == omb_policy_id


@pytest.mark.django_db
def test_pk_id():
    client = APIClient()
    pk_id = 123
    path = "/policies/{0}".format(pk_id)
    response = client.get(path)
    assert response.status_code == 301
    mommy.make(Policy, pk=pk_id)
    response = client.get(path + '.json').json()
    assert response['id'] == pk_id
