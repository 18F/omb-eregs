import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Agency, AgencyGroup, Policy, Requirement, Topic


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


@pytest.mark.django_db
def test_requirements_agencies_filter():
    client = APIClient()
    req1 = mommy.make(Requirement)
    req1.agencies.add(*mommy.make(Agency, _quantity=3))
    req2 = mommy.make(Requirement)
    req2.agencies.add(*mommy.make(Agency, _quantity=4))

    path = "/requirements/"
    response = client.get(path).json()['results']
    assert len(response) == 2

    path += "?agencies__id__in={0}".format(req1.agencies.first().pk)
    response = client.get(path).json()['results']
    assert len(response) == 1
    assert response[0]['req_id'] == req1.req_id


@pytest.mark.django_db
def test_requirements_agencies_nonpublic():
    client = APIClient()
    agencies = mommy.make(Agency, _quantity=3)
    agencies.append(mommy.make(Agency, nonpublic=True))
    req = mommy.make(Requirement)
    req.agencies.add(*agencies)

    path = "/requirements/?id={0}".format(req.pk)
    response = client.get(path).json()['results']
    assert len(response) == 1
    assert len(response[0]['agencies']) == 3


@pytest.mark.django_db
@pytest.mark.parametrize('term, icontains_count, search_count', [
    ('stem', 2, 2),
    ('stems', 1, 2),
    ('stemmed', 1, 2),
    ('full', 2, 1),
])
def test_requirements_fulltext_search(term, icontains_count, search_count):
    client = APIClient()
    mommy.make(Requirement, req_text='Full text stems words')
    mommy.make(Requirement, req_text='Stemmed textual input')
    mommy.make(Requirement, req_text='Fullerton place')

    path = "/requirements/?req_text__icontains=" + term
    response = client.get(path).json()
    assert response['count'] == icontains_count

    path = "/requirements/?req_text__search=" + term
    response = client.get(path).json()
    assert response['count'] == search_count


@pytest.fixture
def applied_agencies():
    a_req, a_group_match, a_group_nonmatch = mommy.make(Agency, _quantity=3)
    g_match, g_nonmatch = mommy.make(AgencyGroup, _quantity=2)
    g_match.agencies.add(a_group_match)
    g_nonmatch.agencies.add(a_group_nonmatch)
    req = mommy.make(Requirement)
    req.agencies.add(a_req)
    req.agency_groups.add(g_match)
    yield a_req, a_group_match, a_group_nonmatch


@pytest.mark.django_db
def test_all_agencies_agency_match(applied_agencies):
    a_req, _, _ = applied_agencies
    path = "/requirements/?all_agencies__id__in=42,99,{0}".format(a_req.pk)
    response = APIClient().get(path).json()['results']
    assert response


@pytest.mark.django_db
def test_all_agencies_agency_group(applied_agencies):
    _, a_group_match, _ = applied_agencies
    path = "/requirements/?all_agencies__id__in={0} ".format(a_group_match.pk)
    response = APIClient().get(path).json()['results']
    assert response


@pytest.mark.django_db
def test_all_agencies_agency_nonmatching_group(applied_agencies):
    _, _, a_group_nonmatch = applied_agencies
    path = "/requirements/?all_agencies__id__in={0}".format(
        a_group_nonmatch.pk)
    response = APIClient().get(path).json()['results']
    assert not response
