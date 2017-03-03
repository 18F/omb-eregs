import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Keyword, Requirement


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
