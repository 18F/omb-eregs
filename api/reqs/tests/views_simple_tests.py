import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Agency


@pytest.mark.django_db
def test_filter_agency_by_abbr():
    mommy.make(Agency)

    pclob = mommy.make(Agency, abbr='PCLOB',
                       name='Privacy and Civil Liberties Oversight Board')

    gsa = mommy.make(Agency, name='General Services Administration')
    client = APIClient()

    response = client.get('/agencies/').json()
    assert response['count'] == 3

    response = client.get('/agencies/?search=pclob').json()
    assert response['count'] == 1
    assert response['results'][0]['id'] == pclob.id

    response = client.get('/agencies/?search=general').json()
    assert response['count'] == 1
    assert response['results'][0]['id'] == gsa.id
