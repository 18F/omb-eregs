import argparse
import csv
import sys

from django.core.management.base import BaseCommand

from reqs.models import Requirement


class Command(BaseCommand):
    help = 'Populate requirements from a CSV'   # noqa

    def add_arguments(self, parser):
        parser.add_argument(
            'input_file', nargs='?', type=argparse.FileType('r'),
            default=sys.stdin)

    def handle(self, *args, **options):
        reqs = []
        for row in csv.DictReader(options['input_file']):
            params = dict(
                policy_number=row['policyNumber'],
                policy_title=row['policyTitle'],
                uri_policy_id=row['uriPolicyId'],
                omb_policy_id=row['ombPolicyId'],
                policy_type=row['policyType'],
                policy_issuance_year=row['policyIssuanceYear'],
                policy_subset=row['policySunset'],
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
                hardware=bool(row['Hardware/Government Furnished Equipment '
                                  '(GFE) (Keywords)']),
                transparency=bool(row['IT Transparency (Open Data, FOIA, '
                                      'Public Records, etc.) (Keywords)']),
                statistics=bool(row['Agency Statistics (Keywords)']),
                customer_services=bool(row['Customer Services (Keywords)']),
                governance=bool(row['Governance (Keywords)']),
                financial_systems=bool(row['Financial Systems (Keywords)']),
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
        Requirement.objects.bulk_create(reqs)
