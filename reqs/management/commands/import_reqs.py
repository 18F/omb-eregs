import argparse
import csv
import logging
import sys
from datetime import datetime

from django.core.management.base import BaseCommand

from reqs.models import Policy, PolicyTypes, Requirement

logger = logging.getLogger(__name__)


def convert_omb_policy_id(string):
    if string in ('NA', 'None'):
        return ''
    return string


def convert_policy_type(string):
    """Raises a ValueError if the string type can't be found"""
    if 'memo' in string.lower():
        return PolicyTypes.memorandum
    elif 'circular' in string.lower():
        return PolicyTypes.circular
    return PolicyTypes(string)


def convert_date(string):
    """Tries to convert a date string into a date. Accounts for NA. May raise
    a ValueError"""
    if string not in ('NA', 'None specified'):
        return datetime.strptime(string, '%m/%d/%Y').date()


def policy_from_row(row):
    return Policy.objects.create(
        policy_number=int(row['policyNumber']),
        title=row['policyTitle'],
        uri=row['uriPolicyId'],
        omb_policy_id=convert_omb_policy_id(row['ombPolicyId']),
        policy_type=convert_policy_type(row['policyType']).value,
        issuance=convert_date(row['policyIssuanceYear']),
        sunset=convert_date(row['policySunset'])
    )


def keywords(row):
    to_return = []
    for field, value in row.items():
        if field == 'Other (Keywords)':
            to_return.extend(kw.strip()
                             for kw_semi in value.split(';')
                             for kw in kw_semi.split(',')
                             if kw.strip())
        elif '(Keywords)' in field and value:
            to_return.append(field.replace('(Keywords)', '').strip())
    return to_return


class Command(BaseCommand):
    help = 'Populate requirements from a CSV'   # noqa

    def add_arguments(self, parser):
        parser.add_argument(
            'input_file', nargs='?', type=argparse.FileType('r'),
            default=sys.stdin)

    def handle(self, *args, **options):
        policies = {}
        for idx, row in enumerate(csv.DictReader(options['input_file'])):
            try:
                policy_num = row['policyNumber']
                if policy_num not in policies:
                    policies[policy_num] = policy_from_row(row)
                params = dict(
                    policy=policies[policy_num],
                    req_id=row['reqId'],
                    issuing_body=row['issuingBody'],
                    policy_section=row['policySection'],
                    policy_sub_section=row['policySubSection'],
                    req_text=row['reqText'],
                    verb=row['verb'],
                    impacted_entity=row['Impacted Entity'],
                    req_deadline=row['reqDeadline'],
                    citation=row['citation'],
                )
                req = Requirement.objects.create(**params)
                req.keywords.add(*keywords(row))
            except ValueError as err:
                logger.warning("Problem with this row %s: %s", idx, err)
