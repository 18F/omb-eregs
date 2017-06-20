from collections import namedtuple

import pytest
from model_mommy import mommy

from reqs.management.commands import link_agencies, sync_agencies
from reqs.models import Agency, AgencyGroup, Requirement


@pytest.fixture
def populate_agencies():
    cmd = sync_agencies.Command()
    cmd.create_system_groups()
    mommy.make(Agency, name="Aquarius", omb_agency_code="123")
    dod = mommy.make(Agency, name="Department of Defense", abbr="DOD",
                     omb_agency_code="111")
    mommy.make(Agency, name="Department of Homeland Security", abbr="DHS",
               omb_agency_code="100")
    mommy.make(Agency, name="General Services Administration", abbr="GSA",
               omb_agency_code="101")
    mommy.make(Agency, name="Department of Justice", abbr="Justice",
               omb_agency_code="102")
    mommy.make(Agency, name="Department of Foo", abbr="FOO",
               omb_agency_code="112")

    MockAgencies = namedtuple("MockAgencies", ["dod", "all_agencies"])
    all_agencies_group = AgencyGroup.objects.get(slug="all-agencies")
    mock_agencies = MockAgencies(dod=dod, all_agencies=all_agencies_group)
    yield mock_agencies


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
    for agency_set, agency_group, req in zip(agencies, agency_groups, reqs):
        req_agencies = {a.abbr for a in req.agencies.all()}
        assert req_agencies == agency_set
        req_groups = {g.slug for g in req.agency_groups.all()}
        assert req_groups == agency_group


@pytest.mark.django_db
def test_link_requirements(populate_agencies):
    dod_req = mommy.make(Requirement, impacted_entity="DOD")
    all_agencies_req = mommy.make(Requirement, impacted_entity="All agencies")
    dod_agency = populate_agencies.dod
    all_agencies_group = populate_agencies.all_agencies

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
