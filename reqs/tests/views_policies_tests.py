from collections import namedtuple

import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Policy, Requirement, Topic

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
    reqs[0][0].topics.add(topics[0].name)
    reqs[0][1].topics.add(topics[1].name)
    reqs[0][2].topics.add(topics[0].name, topics[1].name)
    reqs[1][0].topics.add(topics[1].name)
    reqs[1][1].topics.add(topics[1].name, topics[2].name)
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
