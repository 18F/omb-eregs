import pytest
from model_mommy import mommy

from reqs.management.commands import link_agencies
from reqs.management.commands.sync_agencies import Command as SynchCommand
from reqs.models import Agency, AgencyGroup, Requirement


@pytest.fixture
def populate_agencies():
    synch = SynchCommand()
    synch.create_system_groups()
    synch.sync_row({
        'agencyAbbreviation': None,
        'agencyCode': '123',
        'agencyName': 'Aquarius',
        'agencyType': '5-Other Branches',
        'CFO_Act': '1',
        'CIO_Council': None,
    })
    synch.sync_row({
        'agencyAbbreviation': "DOD",
        'agencyCode': '111',
        'agencyName': 'Department of Defense',
        'agencyType': '',
        'CFO_Act': '1',
        'CIO_Council': None,
    })
    synch.sync_row({
        'agencyAbbreviation': "DHS",
        'agencyCode': '100',
        'agencyName': 'Department of Homeland Security',
        'agencyType': '',
        'CFO_Act': '1',
        'CIO_Council': None,
    })
    synch.sync_row({
        'agencyAbbreviation': "GSA",
        'agencyCode': '101',
        'agencyName': 'General Services Administration',
        'agencyType': '',
        'CFO_Act': '1',
        'CIO_Council': None,
    })
    synch.sync_row({
        'agencyAbbreviation': "Justice",
        'agencyCode': '102',
        'agencyName': 'Department of Justice',
        'agencyType': '',
        'CFO_Act': '1',
        'CIO_Council': None,
    })
    synch.sync_row({
        'agencyAbbreviation': "FOO",
        'agencyCode': '112',
        'agencyName': 'Department of Foo',
        'agencyType': '',
        'CFO_Act': None,
        'CIO_Council': None,
    })


@pytest.mark.django_db
@pytest.mark.parametrize("impacted_entity,agencies,agency_groups", [
    (("",), (set(),), (set(),)),
    (("All agencies, Defense",), ({"DOD"},), ({"all-agencies"},)),
    (("dhs, Defense",), ({"DHS", "DOD"},), (set(),)),
    (("CFO, Defense",), ({"DOD"},), ({"cfo-act"},)),
    (("CFO; Defense; all agencies",), ({"DOD"},),
     ({"all-agencies", "cfo-act"},)),
    (("All agencies", "DOD"), (set(), {"DOD"}), ({"all-agencies"}, set())),
    (("CFO\nDHS\nGSA\nDOJ\nDOD",), ({"DHS", "DOD", "Justice", "GSA"},),
     ({"cfo-act"},)),
    (("All agencies\nDHS\nGSA\nDOJ\nDOD",),
     ({"DHS", "DOD", "Justice", "GSA"},), ({"all-agencies"},)),
    (("DHS\nGSA\nDOJ\nDOD",), ({"DHS", "DOD", "Justice", "GSA"},),
     (set(),)),
    (("Federal CFO Council, DHS\nGSA\nDOJ\nDOD",),
     ({"DHS", "DOD", "Justice", "GSA"},), (set(),)),
    (("All agencies except micro agencies\nDHS\nGSA\nDOJ\nDOD",),
     ({"DHS", "DOD", "Justice", "GSA"},), (set(),)),
    (("All agencies except Paperwork\nDHS\nGSA\nDOJ\nDOD",),
     ({"DHS", "DOD", "Justice", "GSA"},), (set(),)),
    (("department of homeland\ngeneral services\nJustice\nDefense",),
     ({"DHS", "DOD", "Justice", "GSA"},), (set(),)),
], ids=repr)
def test_linking(populate_agencies, impacted_entity, agencies,
                 agency_groups):
    reqs = [mommy.make(Requirement, impacted_entity=_) for _ in
            impacted_entity]
    link_agencies.Command().handle()
    for i, req in enumerate(reqs):
        req_agencies = {_.abbr for _ in req.agencies.all()}
        assert req_agencies == agencies[i]
        req_groups = {_.slug for _ in req.agency_groups.all()}
        assert req_groups == agency_groups[i]


@pytest.mark.django_db
def test_link_requirements(populate_agencies):
    dod_req = mommy.make(Requirement, impacted_entity="DOD")
    dod_agency = Agency.objects.get(abbr="DOD")
    all_agencies_req = mommy.make(Requirement, impacted_entity="All agencies")
    all_agencies_group = AgencyGroup.objects.get(slug="all-agencies")

    assert Requirement.objects.count() == 2
    assert Requirement.objects.filter(agencies=None,
                                      agency_groups=None).count() == 2

    cmd = link_agencies.Command()
    cmd.process_requirements()
    assert Requirement.objects.count() == 2
    assert Requirement.objects.filter(agencies=None,
                                      agency_groups=None).count() == 0
    assert list(dod_req.agencies.all()) == [dod_agency]
    assert list(dod_req.agency_groups.all()) == []
    assert list(all_agencies_req.agencies.all()) == []
    assert list(all_agencies_req.agency_groups.all()) == [all_agencies_group]

    link_agencies.reset_agency_relationships()
    assert Requirement.objects.count() == 2
    assert Requirement.objects.filter(agencies=None,
                                      agency_groups=None).count() == 2
