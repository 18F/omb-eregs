from collections import namedtuple

import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Policy, Requirement, Topic


@pytest.mark.django_db
@pytest.mark.parametrize('path,num_results', (
    ('/topics/', 10),
    ('/topics/?name=0000000000', 1),
    ('/topics/?name=000000', 0),
    ('/topics/?name__icontains=000000', 1),
))
def test_topic_filtering(path, num_results):
    client = APIClient()
    for i in range(10):
        mommy.make(Topic, name=str(i)*10)
    results = client.get(path).json()['results']
    assert len(results) == num_results


@pytest.mark.django_db
@pytest.mark.parametrize('path,num_results', (
    ('/requirements/', 3),
    ('/requirements/?topics__name=0000', 1),
    ('/requirements/?topics__name=1111', 2),
    ('/requirements/?topics__name__in=2222,3333', 2),
))
def test_requirement_filtering_topic(path, num_results):
    """We can filter by a nested topic"""
    client = APIClient()
    for i in range(4):
        mommy.make(Topic, name=str(i)*4)
    req1, req2, req3 = mommy.make(Requirement, _quantity=3)
    req1.topics.add('0000', '1111')
    req2.topics.add('1111', '2222')
    req3.topics.add('3333')
    results = client.get(path).json()['results']
    assert len(results) == num_results


@pytest.mark.django_db
def test_requirements_queryset_order():
    """We should receive results in # of matches order"""
    client = APIClient()
    topics = [mommy.make(Topic, name=str(i + 1)*4) for i in range(6)]
    req1, req2, req3 = [mommy.make(Requirement, req_id=str(i + 1))
                        for i in range(3)]
    req1.topics.add('1111', '2222')
    req2.topics.add('2222', '3333', '4444')
    req3.topics.add('1111', '5555', '6666')
    param = ','.join(str(topics[i].pk) for i in (0, 2, 3))
    response = client.get('/requirements/?topics__id__in=' + param)
    req_ids = [req['req_id'] for req in response.json()['results']]
    assert req_ids == ['2', '1', '3']


@pytest.mark.django_db
@pytest.mark.parametrize('params,req_ids,policy_numbers,result', (
    ('', (1, 2, 3), (10, 11, 12), ["1", "2", "3"]),
    ('ordering', (1, 2, 3), (10, 11, 12), ["1", "2", "3"]),
    ('ordering=', (1, 2, 3), (10, 11, 12), ["1", "2", "3"]),
    ('', (3, 2, 1), (10, 11, 12), ["1", "2", "3"]),
    ('ordering=-req_id', (2, 1, 3), (10, 11, 12), ["3", "2", "1"]),
    ('ordering=policy__policy_number', (1, 2, 3), (20, 30, 10),
     ["3", "1", "2"]),
    ('ordering=-policy__policy_number', (1, 2, 3), (20, 30, 10),
     ["2", "1", "3"]),
), ids=repr)
def test_requirements_ordered_by_key(params, req_ids, policy_numbers, result):
    """
    We should be able to pass in arbitrary sort fields.
    """
    client = APIClient()
    for req_id, policy_number in zip(req_ids, policy_numbers):
        policy = mommy.make(Policy, policy_number=str(policy_number))
        mommy.make(Requirement, req_id=str(req_id), policy=policy)
    path = "/requirements/?{0}".format(params)
    response = client.get(path)
    req_ids = [req['req_id'] for req in response.json()['results']]
    assert req_ids == result


@pytest.mark.django_db
@pytest.mark.parametrize('params,result', (
    ('req_id', ["1", "2", "3"]),
    ('policy__policy_number', ["3", "1", "2"]),
    ('policy__policy_number,-req_id', ["3", "2", "1"]),
    ('policy__policy_number,verb', ["3", "2", "1"]),
    ('policy__policy_number,req_id', ["3", "1", "2"]),
), ids=repr)
def test_requirements_ordered_by_multiple_keys(params, result):
    """
    We should be able to pass in arbitrary sort fields.
    """
    policy1 = mommy.make(Policy, policy_number="23")
    policy2 = mommy.make(Policy, policy_number="17")
    mommy.make(Requirement, req_id=1, verb="zoot", policy=policy1)
    mommy.make(Requirement, req_id=2, verb="yo", policy=policy1)
    mommy.make(Requirement, req_id=3, verb="xi", policy=policy2)
    client = APIClient()
    path = "/requirements/?ordering={0}".format(params)
    response = client.get(path)
    req_ids = [req['req_id'] for req in response.json()['results']]
    assert req_ids == result


@pytest.mark.django_db
@pytest.mark.parametrize('params', (
    "gibberish",
    "-gibberish",
    "-",
    "asdf",
    "policy__",
    "policy__gibberish",
))
def test_requirements_ordered_by_bad_key(params):
    """
    Sorting by keys that don't exist should doesn't affect sort order.
    """
    client = APIClient()
    for i in range(3):
        policy = mommy.make(Policy, policy_number=str(10 - i))
        mommy.make(Requirement, req_id=str(i), policy=policy)
    path = "/requirements/?ordering={0}".format(params)
    response = client.get(path)
    req_ids = [req['req_id'] for req in response.json()['results']]
    assert req_ids == ['0', '1', '2']


PolicySetup = namedtuple('PolicySetup', ('topics', 'policies', 'reqs'))


@pytest.fixture
def policy_setup():
    topics = mommy.make(Topic, _quantity=3)
    policies = [mommy.make(Policy, policy_number='0'),
                mommy.make(Policy, policy_number='1')]
    reqs = [mommy.make(Requirement, policy=policies[0], _quantity=3),
            mommy.make(Requirement, policy=policies[1], _quantity=4)]
    reqs[0][0].topics.add(topics[0].name)
    reqs[0][1].topics.add(topics[1].name)
    reqs[0][2].topics.add(topics[0].name, topics[1].name)
    reqs[1][0].topics.add(topics[1].name)
    reqs[1][1].topics.add(topics[1].name, topics[2].name)
    yield PolicySetup(topics, policies, reqs)


@pytest.mark.django_db
def test_policies_counts_no_params(policy_setup):
    """The API endpoint should include all requirements when no params are
    given"""
    _, _, reqs = policy_setup
    client = APIClient()

    response = client.get("/policies/").json()
    assert response['count'] == 2
    assert response['results'][0]['total_reqs'] == len(reqs[0])
    assert response['results'][0]['relevant_reqs'] == len(reqs[0])
    assert response['results'][1]['total_reqs'] == len(reqs[1])
    assert response['results'][1]['relevant_reqs'] == len(reqs[1])


@pytest.mark.django_db
def test_policies_counts_filter_req(policy_setup):
    """The API endpoint should include only relevant policies when we filter
    by an attribute of a requirement"""
    _, _, reqs = policy_setup
    client = APIClient()

    path = "/policies/?requirements__req_id=" + reqs[1][1].req_id
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['total_reqs'] == len(reqs[1])
    assert response['results'][0]['relevant_reqs'] == 1


@pytest.mark.django_db
def test_policies_counts_filter_by_one_topic(policy_setup):
    """The API endpoint should include only relevant policies when we filter
    by a single topic"""
    topics, _, reqs = policy_setup
    client = APIClient()

    path = "/policies/?requirements__topics__id__in={0}".format(topics[0].pk)
    response = client.get(path).json()
    assert response['count'] == 1
    assert response['results'][0]['total_reqs'] == len(reqs[0])
    # reqs[0][0] and reqs[0][2]
    assert response['results'][0]['relevant_reqs'] == 2


@pytest.mark.django_db
def test_policies_counts_filter_by_multiple_topics(policy_setup):
    """The API endpoint should include only relevant policies when we filter
    by multiple topics"""
    topics, _, reqs = policy_setup
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
