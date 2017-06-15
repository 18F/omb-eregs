import pytest
from model_mommy import mommy
from reversion.models import Version

from reqs.management.commands.sync_agencies import Command
from reqs.models import Agency, AgencyGroup


@pytest.mark.django_db
def test_create_system_groups():
    """We create agency groups *if they do not already exist*. When creating,
    we generate a version"""
    AgencyGroup.objects.create(slug='cfo-act', name='Alt CFO')
    cmd = Command()
    cmd.create_system_groups()

    assert AgencyGroup.objects.count() == 3
    # We only make a new version for the newly generated groups
    assert Version.objects.get_for_model(AgencyGroup).count() == 2
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
    assert Version.objects.get_for_object(agency).count() == 1
    group_version = Version.objects.get_for_object(agency.groups.get()).first()
    assert group_version.field_dict['agencies'] == [agency.pk]


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
    assert Version.objects.get_for_object(agency).count() == 1
    for group in agency.groups.all():
        group_version = Version.objects.get_for_object(group).first()
        assert group_version.field_dict['agencies'] == [agency.pk]
