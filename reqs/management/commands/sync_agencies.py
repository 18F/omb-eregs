import requests
import reversion
from django.core.management.base import BaseCommand

from reqs.models import Agency, AgencyGroup

SOURCE_URL = ("https://myit-2018.itdashboard.gov/api/v1/ITDB2/dataFeeds/"
              "agency?json=true")
SYSTEM_GROUPS = {
    'executive': 'Executive',
    'cfo-act': 'CFO Act',
    'cio-council': 'CIO Council',
}


class Command(BaseCommand):
    help = ("Create predefined groups where needed and synchronize "  # noqa
            "agency data from itdashboard.gov")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.system_groups = {}

    def handle(self, *args, **options):
        self.create_system_groups()
        data = requests.get(SOURCE_URL).json()
        for row in data['result']:
            self.sync_row(row)
        self.create_group_revision()

    def create_system_groups(self):
        """If AgencyGroups corresponding to the SYSTEM_GROUPS don't exist,
        create them. Also, populate self.system_groups"""
        for slug, name in SYSTEM_GROUPS.items():
            group = AgencyGroup.objects.filter(slug=slug).first()
            if not group:
                with reversion.create_revision():
                    group = AgencyGroup.objects.create(slug=slug, name=name)
            self.system_groups[slug] = group

    def sync_row(self, row):
        """Create/update a single agency from itdashboard.gov"""
        agency = Agency.objects.filter(
            omb_agency_code=row['agencyCode']).first()
        agency = agency or Agency(omb_agency_code=row['agencyCode'])
        agency.name = row['agencyName']
        agency.abbr = row['agencyAbbreviation'] or agency.abbr
        with reversion.create_revision():
            agency.save()

        if row['agencyType'] != '5-Other Branches':
            self.system_groups['executive'].agencies.add(agency)
        if row['CFO_Act']:
            self.system_groups['cfo-act'].agencies.add(agency)
        if row['CIO_Council']:
            self.system_groups['cio-council'].agencies.add(agency)

    def create_group_revision(self):
        """Rather than create a revision for every agency that's added to the
        system groups, we'll create one revision that covers all of the
        additions."""
        with reversion.create_revision():
            for group in self.system_groups.values():
                group.save()
