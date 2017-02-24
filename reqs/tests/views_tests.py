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
    result = client.get(path).json()
    assert len(result) == num_results


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
    result = client.get(path).json()
    assert len(result) == num_results
