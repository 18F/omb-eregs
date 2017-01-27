import argparse
import csv
import logging
import sys
from datetime import datetime

from django.core.management.base import BaseCommand

from reqs.models import PolicyTypes, Requirement

logger = logging.getLogger(__name__)


def convert_omb_policy_id(string):
    if string in ('NA', 'None'):
        return ''
    return string


def convert_policy_type(string):
    """Raises a ValueError if the string type can't be found"""
    if 'memo' in string.lower():
        return PolicyTypes.memorandum
    return PolicyTypes(string)


def convert_date(string):
    """Tries to convert a date string into a date. Accounts for NA. May raise
    a ValueError"""
    if string not in ('NA', 'None specified'):
        return datetime.strptime(string, '%m/%d/%Y').date()


class Command(BaseCommand):
    help = 'Populate requirements from a CSV'   # noqa

    def add_arguments(self, parser):
        parser.add_argument(
            'input_file', nargs='?', type=argparse.FileType('r'),
            default=sys.stdin)

    def handle(self, *args, **options):
        reqs = []
        for row in csv.DictReader(options['input_file']):
            try:
                params = dict(
                    policy_number=row['policyNumber'],
                    policy_title=row['policyTitle'],
                    uri_policy_id=row['uriPolicyId'],
                    omb_policy_id=convert_omb_policy_id(row['ombPolicyId']),
                    policy_type=convert_policy_type(row['policyType']).value,
                    policy_issuance=convert_date(row['policyIssuanceYear']),
                    policy_sunset=convert_date(row['policySunset']),
                    req_id=row['reqId'],
                    issuing_body=row['issuingBody'],
                    policy_section=row['policySection'],
                    policy_sub_section=row['policySubSection'],
                    req_text=row['reqText'],
                    verb=row['verb'],
                    impacted_entity=row['Impacted Entity'],
                    req_deadline=row['reqDeadline'],
                    citation=row['citation'],
                    aquisition=bool(row['Acquisition/Contracts (Keywords)']),
                    human_capital=bool(row['Human Capital (Keywords)']),
                    cloud=bool(row['Cloud (Keywords)']),
                    data_centers=bool(row['Data Centers (Keywords)']),
                    cybersecurity=bool(row['Cybersecurity (Keywords)']),
                    privacy=bool(row['Privacy (Keywords)']),
                    shared_services=bool(row['Shared Services (Keywords)']),
                    it_project_management=bool(row['IT Project Management '
                                                   '(Keywords)']),
                    software=bool(row['Software (Keywords)']),
                    digital_services=bool(row['Digital Services (Keywords)']),
                    mobile=bool(row['Mobile (Keywords)']),
                    hardware=bool(
                        row['Hardware/Government Furnished Equipment (GFE) '
                            '(Keywords)']),
                    transparency=bool(row['IT Transparency (Open Data, FOIA, '
                                          'Public Records, etc.) (Keywords)']),
                    statistics=bool(row['Agency Statistics (Keywords)']),
                    customer_services=bool(
                        row['Customer Services (Keywords)']),
                    governance=bool(row['Governance (Keywords)']),
                    financial_systems=bool(
                        row['Financial Systems (Keywords)']),
                    budget=bool(row['Budget (Keywords)']),
                    governance_org_structure=bool(row['Governance - Org '
                                                      'Structure (Keywords)']),
                    governance_implementation=bool(row[
                        'Governance - Implementation (Keywords)']),
                    data_management=bool(row['Data Management/Standards '
                                             '(Keywords)']),
                    definitions=bool(row['Definitions (Keywords)']),
                    reporting=bool(row['Reporting (Keywords)']),
                    other_keywords=row['Other (Keywords)'],
                )
                reqs.append(Requirement(**params))
            except ValueError as err:
                logger.warning("Problem with this row: %s -- %s", err, row)
        Requirement.objects.bulk_create(reqs)
