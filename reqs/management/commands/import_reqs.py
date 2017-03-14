import argparse
import csv
import logging
import re
import sys

from dateutil import parser as dateutil_parser
from django.core.management.base import BaseCommand

from reqs.models import (Keyword, KeywordConnect, Policy, PolicyTypes,
                         Requirement)

logger = logging.getLogger(__name__)

"""
We have a set of field names that change depending on the input file, and
storing that information in one spot is probably the best appraoch.
"""
FIELDS = {
    "verbs": ("reqVerb", "req_verb", "verb"),
    "req_ids": ("reqId", "reqID", "reqid", "req_Id", "req_ID", "req_id"),
    "entities": ("Impacted Entity", "agenciesImpacted"),
    "citations": ("Citation", "Citation ", "citation"),
    "uri_policy_ids": ("uriPolicyID", "uriPolicyId"),
    "omb_policy_ids": ("ombPolicyID", "ombPolicyId")
}
"""
The same appears to be true for keywords.
See ``KeywordProcessor.normalize_keywords`` for some decisions about keywords
formatting.

Here we're listing the problematic values as dictionary keys, and what they
should be as values (each value is a list, since some inputs should result in
multiple keywords).
"""
KEYWORDS = {
    "Commodity It": ["Commodity IT"],  # This one is due to str.title()
    "Data Management/Standards. Reporting": [
        "Data Management/Standards",
        "Reporting"
    ],
    "Definition": ["Definitions"],
    "Emergency Preparedness?": ["Emergency Preparedness"],
    "Governance - Organization": ["Governance - Org Structure"],
    "Policy Exceptions": ["Policy Exemptions"],
    "Record Management": ["Records Management"],
    "Research & Development": ["Research"],
}


def convert_omb_policy_id(value):
    if value in ('NA', 'None'):
        return ''
    return value


def convert_policy_type(policy_type):
    """Raises a ValueError if the policy type can't be found"""
    policy_type = policy_type.strip()
    if 'memo' in policy_type.lower():
        return PolicyTypes.memorandum.value
    elif 'circular' in policy_type.lower():
        return PolicyTypes.circular.value
    elif policy_type in ('', 'NA'):
        return ''
    else:
        return PolicyTypes(policy_type).value


def convert_date(datestring):
    """Tries to convert a date datestring into a date. Accounts for NA. May
    raise a ValueError"""
    datestring = datestring.rstrip('†')
    if datestring not in ('NA', 'None specified', 'TBA', 'None', 'N/A', ''):
        try:
            return dateutil_parser.parse(datestring).date()
        except ValueError:  # dateutil's error messages aren't friendly
            raise ValueError("Not a date: {0}".format(datestring))


def find_key(key_name, row):
    """
    Inconsistencies in the CSVs mean we have to look for one of several
    possibilities for header names.
    """
    options = FIELDS[key_name]
    acceptable_numbers = (0, 1)
    keys = [k for k in options if k in row.keys()]
    if len(keys) not in acceptable_numbers:
        raise ValueError(
            "Could not determine key (should be one of {0}).".format(
                str(options)))
    return keys[0]


def handle_transposed_reqstatus(row):
    """
    There are a number of rows that have date content in the ``reqStatus``
    field and non-date content in the ``policySunset`` field.

    We're going to assume that this means they were transposed, and correct
    those rows.
    """
    if "reqStatus" not in row:
        return row

    status_date, sunset_date = None, None
    try:
        status_date = dateutil_parser.parse(
            row["reqStatus"]).strftime("%Y-%m-%d")
    except ValueError:
        pass  # We expect this to not be a date.
    try:
        status_date = dateutil_parser.parse(
            row["policySunset"]).strftime("%Y-%m-%d")
    except ValueError:  # dateutil's error messages aren't friendly
        logger.warning("Not a date in policySunset: {0}".format(
            row["policySunset"]))
    if status_date is not None and sunset_date is None:
        # Looks like they've been transposed.
        row["reqStatus"] = row["policyStatus"]
        row["policySunset"] = status_date
    return row


class PolicyProcessor:
    """Creates/updates and tracks Policy objects based on the data found in
    CSV rows"""
    def __init__(self):
        self.policies = {}

    def from_row(self, row):
        """Retrieve/create/update a Policy object"""
        policy_number = int(row['policyNumber'])
        uri_key = find_key("uri_policy_ids", row)
        omb_key = find_key("omb_policy_ids", row)
        if policy_number not in self.policies:
            params = {
                'policy_number': policy_number,
                'title': row['policyTitle'],
                'uri': row[uri_key],
                'omb_policy_id': convert_omb_policy_id(row[omb_key]),
                'policy_status': row.get("policyStatus", ""),
                'policy_type': convert_policy_type(row['policyType']),
                'issuance': convert_date(row['policyIssuanceYear']),
                'sunset': convert_date(row['policySunset'])
            }
            policy, _ = Policy.objects.update_or_create(
                policy_number=policy_number, defaults=params)
            self.policies[policy_number] = policy
        return self.policies[policy_number]


def priority_split(text, *splitters):
    """When we don't know which character is being used to combine text, run
    through a list of potential splitters and split on the first"""
    present = [s for s in splitters if s in text]
    # fall back to non-present splitter; ensures we have a splitter
    splitters = present + list(splitters)
    splitter = splitters[0]
    return [seg.strip() for seg in text.split(splitter) if seg.strip()]


class KeywordProcessor:
    """Creates or retrieves Keyword models"""
    def __init__(self, fields):
        self.cache = {}
        self.fields = fields

    def normalize_keywords(self, values):
        """
        Executive decisions:
        +   Keywords cannot contain whitespace at the start or end.
        +   All whitespace will be converted to a single space.
        +   Keyword values must be init-caps.
        +   Use of hyphens/ampersands as separators requires a single space
            around the separator.
        """

        normalized = []
        for value in values:
            value = value.replace("-", " - ")
            value = value.replace("&", " & ")
            value = re.sub("\s+", " ", value).strip()
            value = value.title()
            if value in KEYWORDS:
                normalized.extend(KEYWORDS[value])
            else:
                normalized.append(value)
        return normalized

    def keywords(self, row):
        to_return = []
        for field in self.fields:
            value = row.get(field)
            if field in ('Other', 'Other (Keywords)'):
                values = self.normalize_keywords(
                    priority_split(value, ';', ','))
                to_return.extend(values)
            elif value:
                to_return.append(field.replace("(Keywords)", "").strip())
        return to_return

    def connections(self, row, req_pk):
        for keyword in self.keywords(row):
            if keyword not in self.cache:
                self.cache[keyword] = Keyword.objects.get_or_create(
                    name=keyword)[0].pk
            yield KeywordConnect(tag_id=self.cache[keyword],
                                 content_object_id=req_pk)


class RowProcessor:
    """Creates Requirement objects, Policies, and Keyword connections,
    raising exceptions if something goes wrong with the process."""
    def __init__(self, keywords=None):
        self.policies = PolicyProcessor()
        if keywords is None:
            keywords = []
        self.keywords = KeywordProcessor(keywords)
        self.connections = []
        self.req_ids = set()

    def add(self, row):
        req_key = find_key("req_ids", row)
        req_id = row[req_key]
        if req_id in ('None', ''):
            raise ValueError("Requirement without ID")
        if req_id in self.req_ids:
            raise ValueError("Duplicated Req ID: {0}".format(req_id))
        row = handle_transposed_reqstatus(row)
        verb_key = find_key("verbs", row)
        impacted_key = find_key("entities", row)
        citation_key = find_key("citations", row)

        params = dict(
            citation=row[citation_key],
            impacted_entity=row[impacted_key],
            issuing_body=row['issuingBody'],
            omb_data_collection=row.get("ombDataCollection", ""),
            policy=self.policies.from_row(row),
            policy_section=row['policySection'],
            policy_sub_section=row['policySubSection'],
            precedent=row.get("precedent", ""),
            related_reqs=row.get("relatedReqs", ""),
            req_deadline=row['reqDeadline'],
            req_id=req_id,
            req_text=row['reqText'],
            verb=row[verb_key],
        )
        req, _ = Requirement.objects.update_or_create(
            req_id=req_id, defaults=params)
        self.connections.extend(self.keywords.connections(row, req.pk))
        self.req_ids.add(req_id)


class Command(BaseCommand):
    help = 'Populate requirements from a CSV'   # noqa

    def add_arguments(self, parser):
        parser.add_argument(
            'input_file', nargs='?', type=argparse.FileType('r'),
            default=sys.stdin)
        parser.add_argument('--status', type=int,
                            help='How frequently to log status')

    def handle(self, *args, **options):
        data = csv.DictReader(options['input_file'])
        # We think that any columns after "Citation " will be keyword columns.
        citation_key = find_key("citations", {k: "" for k in data.fieldnames})
        keywords = data.fieldnames[data.fieldnames.index(citation_key) + 1:]
        rows = RowProcessor(keywords)
        for idx, row in enumerate(data):
            if options['status'] and idx % options['status'] == 0:
                logger.info('Processed %s rows', idx)
            try:
                rows.add(row)
            except ValueError as err:
                logger.warning("Problem with row %s: %s", idx + 1, err)
        # Delete all keyword connections which may exist in the DB
        KeywordConnect.objects.filter(
            content_object__req_id__in=rows.req_ids).delete()
        KeywordConnect.objects.bulk_create(rows.connections)
