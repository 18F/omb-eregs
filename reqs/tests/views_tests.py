import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Keyword, Policy, Requirement


@pytest.mark.django_db
@pytest.mark.parametrize('path,num_results', (
    ('/keywords/', 10),
    ('/keywords/?name=0000000000', 1),
    ('/keywords/?name=000000', 0),
    ('/keywords/?name__icontains=000000', 1),
))
def test_keyword_filtering(path, num_results):
    client = APIClient()
    for i in range(10):
        mommy.make(Keyword, name=str(i)*10)
    results = client.get(path).json()['results']
    assert len(results) == num_results


@pytest.mark.django_db
@pytest.mark.parametrize('path,num_results', (
    ('/requirements/', 3),
    ('/requirements/?keywords__name=0000', 1),
    ('/requirements/?keywords__name=1111', 2),
    ('/requirements/?keywords__name__in=2222,3333', 2),
))
def test_requirement_filtering_keyword(path, num_results):
    """We can filter by a nested keyword"""
    client = APIClient()
    for i in range(4):
        mommy.make(Keyword, name=str(i)*4)
    req1, req2, req3 = mommy.make(Requirement, _quantity=3)
    req1.keywords.add('0000', '1111')
    req2.keywords.add('1111', '2222')
    req3.keywords.add('3333')
    results = client.get(path).json()['results']
    assert len(results) == num_results


@pytest.mark.django_db
def test_requirements_queryset_order():
    """We should receive results in # of matches order"""
    client = APIClient()
    for i in range(6):
        mommy.make(Keyword, name=str(i + 1)*4)
    req1, req2, req3 = [mommy.make(Requirement, req_id=str(i + 1))
                        for i in range(3)]
    req1.keywords.add('1111', '2222')
    req2.keywords.add('2222', '3333', '4444')
    req3.keywords.add('1111', '5555', '6666')
    response = client.get('/requirements/?keywords__name__in=1111,3333,4444')
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
