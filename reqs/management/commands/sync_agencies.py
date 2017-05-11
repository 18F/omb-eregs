import requests
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

    def create_system_groups(self):
        """If AgencyGroups corresponding to the SYSTEM_GROUPS don't exist,
        create them. Also, populate self.system_groups"""
        for slug, name in SYSTEM_GROUPS.items():
            self.system_groups[slug], _ = AgencyGroup.objects.get_or_create(
                slug=slug, defaults=dict(name=name))

    def sync_row(self, row):
        """Create/update a single agency from itdashboard.gov"""
        agency, _ = Agency.objects.get_or_create(
            omb_agency_code=row['agencyCode'])
        agency.name = row['agencyName']
        agency.abbr = row['agencyAbbreviation'] or agency.abbr
        agency.save()

        if row['agencyType'] != '5-Other Branches':
            agency.groups.add(self.system_groups['executive'])
        if row['CFO_Act']:
            agency.groups.add(self.system_groups['cfo-act'])
        if row['CIO_Council']:
            agency.groups.add(self.system_groups['cio-council'])
