import random

import pytest
from model_mommy import mommy
from rest_framework.test import APIClient

from reqs.models import Agency


@pytest.mark.django_db
def test_filter_agency_by_abbr():
    # This is a workaround for https://github.com/18F/omb-eregs/issues/673.
    random.seed(1)

    mommy.make(Agency)
    fbi = mommy.make(Agency, abbr='FBI')
    gsa = mommy.make(Agency, name='General Services Administration')
    client = APIClient()

    response = client.get('/agencies/').json()
    assert response['count'] == 3

    response = client.get('/agencies/?search=fbi').json()
    assert response['count'] == 1
    assert response['results'][0]['id'] == fbi.id

    response = client.get('/agencies/?search=general').json()
    assert response['count'] == 1
    assert response['results'][0]['id'] == gsa.id
