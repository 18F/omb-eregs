import pytest
from django.core.management import call_command
from model_mommy import mommy
from reversion.models import Version

from reqs.models import AgencyGroup, Policy


@pytest.mark.django_db
def test_empty_database():
    call_command('make_revisions')
    assert Version.objects.count() == 0


@pytest.mark.django_db
def test_specify_model():
    mommy.make(AgencyGroup, _quantity=3)
    mommy.make(Policy, _quantity=4)

    call_command('make_revisions', 'reqs.AgencyGroup')
    assert Version.objects.count() == 3
    assert Version.objects.get_for_model(AgencyGroup).count() == 3
    assert Version.objects.get_for_model(Policy).count() == 0


@pytest.mark.django_db
def test_call_twice():
    mommy.make(AgencyGroup, _quantity=3)
    mommy.make(Policy, _quantity=4)

    call_command('make_revisions')
    assert Version.objects.count() == 3 + 4

    call_command('make_revisions')
    assert Version.objects.count() == 2 * (3 + 4)
