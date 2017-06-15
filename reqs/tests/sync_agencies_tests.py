import pytest
from model_mommy import mommy

from reqs.management.commands.sync_agencies import Command
from reqs.models import Agency, AgencyGroup


@pytest.mark.django_db
def test_create_system_groups():
    AgencyGroup.objects.create(slug='cfo-act', name='Alt CFO')
    cmd = Command()
    cmd.create_system_groups()

    assert AgencyGroup.objects.count() == 3
    assert AgencyGroup.objects.get(slug='executive').name == 'Executive'
    # name not changed
    assert AgencyGroup.objects.get(slug='cfo-act').name == 'Alt CFO'
    assert AgencyGroup.objects.get(slug='cio-council').name == 'CIO Council'


@pytest.mark.django_db
def test_sync_row_new():
    cmd = Command()
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
    assert group_slugs == {'cfo-act'}


@pytest.mark.django_db
def test_sync_row_existing():
    mommy.make(Agency, omb_agency_code='90210')
    assert Agency.objects.count() == 1

    cmd = Command()
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
    assert group_slugs == {'cio-council', 'executive'}
