from unittest.mock import Mock

import pytest
from django.core.management import call_command
from model_mommy import mommy
from reversion.models import Version

from reqs.management.commands import sync_agencies
from reqs.models import Agency, AgencyGroup


@pytest.mark.django_db
def test_create_system_groups():
    """We create agency groups *if they do not already exist*. When creating,
    we generate a version"""
    AgencyGroup.objects.create(slug='cfo-act', name='Alt CFO')
    cmd = sync_agencies.Command()
    cmd.create_system_groups()

    assert AgencyGroup.objects.count() == 4
    # We only make a new version for the newly generated groups
    assert Version.objects.get_for_model(AgencyGroup).count() == 3

    assert AgencyGroup.objects.get(slug='executive').name == 'Executive'
    # name not changed
    assert AgencyGroup.objects.get(slug='cfo-act').name == 'Alt CFO'
    assert AgencyGroup.objects.get(slug='cio-council').name == 'CIO Council'


@pytest.mark.django_db
def test_sync_row_new():
    cmd = sync_agencies.Command()
    cmd.create_system_groups()
    cmd.sync_row({
        'agencyAbbreviation': None,
        'agencyCode': '123',
        'agencyName': 'Aquarius',
        'agencyType': '5-Other Branches',
        'CFO_Act': '1',
        'CIO_Council': None,
    })

    assert Agency.objects.count() == 1
    agency = Agency.objects.get()
    assert agency.name == 'Aquarius'
    assert agency.abbr == ''
    assert agency.omb_agency_code == '123'
    assert agency.public
    group_slugs = {g.slug for g in agency.groups.all()}
    assert Version.objects.get_for_object(agency).count() == 1
    assert group_slugs == {'all-agencies', 'cfo-act'}


@pytest.mark.django_db
def test_sync_row_existing():
    mommy.make(Agency, omb_agency_code='90210')
    assert Agency.objects.count() == 1

    cmd = sync_agencies.Command()
    cmd.create_system_groups()
    cmd.sync_row({
        'agencyAbbreviation': 'BH',
        'agencyCode': '90210',
        'agencyName': 'New Name Here',
        'agencyType': '1-CFO Act',  # this will be ignored
        'CFO_Act': '',
        'CIO_Council': '1',
    })

    assert Agency.objects.count() == 1
    agency = Agency.objects.get()
    assert agency.name == 'New Name Here'
    assert agency.abbr == 'BH'
    assert agency.omb_agency_code == '90210'
    assert agency.public
    group_slugs = {g.slug for g in agency.groups.all()}
    assert group_slugs == {'all-agencies', 'cio-council', 'executive'}
    assert Version.objects.get_for_object(agency).count() == 1


@pytest.mark.django_db
def test_group_versions(monkeypatch):
    """Avoid creating dozens of versions per agency group."""
    monkeypatch.setattr(sync_agencies, 'requests', Mock())
    sync_agencies.requests.get.return_value.json.return_value = {
        'result': [
            {'agencyAbbreviation': c, 'agencyCode': c, 'agencyName': c,
             'agencyType': c, 'CFO_Act': '1', 'CIO_Council': ''}
            for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    }

    call_command('sync_agencies')

    cfo = AgencyGroup.objects.get(slug='cfo-act')
    versions = Version.objects.get_for_object(cfo)
    assert versions.count() == 2    # one for creation, one final
    assert len(versions[0].field_dict['agencies']) == 26
    assert versions[1].field_dict['agencies'] == []
