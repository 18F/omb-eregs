import pytest
from django.contrib.auth.models import Group

from ereqs_admin import apps


@pytest.mark.django_db
def test_create_editors_creates():
    # clear out groups created w/ a post-migrate signal
    Group.objects.all().delete()

    apps.create_editors()

    assert Group.objects.count() == 1
    # three permissions per model
    assert Group.objects.first().permissions.count() == 3*4


@pytest.mark.django_db
def test_create_editors_once():
    # clear out groups created w/ a post-migrate signal
    Group.objects.all().delete()

    apps.create_editors()
    apps.create_editors()
    apps.create_editors()

    assert Group.objects.count() == 1
    # three permissions per model
    assert Group.objects.first().permissions.count() == 3*4
