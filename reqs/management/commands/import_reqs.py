import argparse
import csv
import logging
import re
import sys

from dateutil import parser as dateutil_parser
from django.core.management.base import BaseCommand

from reqs.models import Policy, PolicyTypes, Requirement, Topic

logger = logging.getLogger(__name__)

"""
We have a set of field names that change depending on the input file, and
storing that information in one spot is probably the best approach.
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
The same appears to be true for topics.
See ``TopicProcessor.normalize_topics`` for some decisions about topics
formatting.

Here we're listing the problematic values as dictionary keys, and what they
should be as values (each value is a list, since some inputs should result in
multiple topics).
"""
TOPICS = {
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
        return PolicyTypes.memorandum.name
    elif 'circular' in policy_type.lower():
        return PolicyTypes.circular.name
    elif policy_type in ('', 'NA'):
        return ''
    else:
        return PolicyTypes(policy_type).name


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
    if "reqStatus" not in row or "policySunset" not in row:
        return row

    def is_date(value, warn=False):
        try:
            dateutil_parser.parse(value)
        except ValueError:
            if warn:
                req_id = row[find_key("req_ids", row)]
                logger.warning(
                    "Not a valid date: {0} ({1})".format(value, req_id))
            return False

        return True

    status, sunset = row["reqStatus"], row["policySunset"]

    if is_date(status) and not is_date(sunset, warn=True):
        row["reqStatus"], row["policySunset"] = sunset, status

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
                'sunset': convert_date(row['policySunset']),
                'issuing_body': row['issuingBody'],
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


class TopicProcessor:
    """Creates or retrieves Topic models"""
    def __init__(self, fields):
        self.cache = {}
        self.fields = fields

    def normalize_topics(self, values):
        """
        Executive decisions:
        +   Topics cannot contain whitespace at the start or end.
        +   All whitespace will be converted to a single space.
        +   Topic values must be init-caps.
        +   Use of hyphens/ampersands as separators requires a single space
            around the separator.
        """

        normalized = []
        for value in values:
            value = value.replace("-", " - ")
            value = value.replace("&", " & ")
            value = re.sub("\s+", " ", value).strip()
            value = value.title()
            if value in TOPICS:
                normalized.extend(TOPICS[value])
            else:
                normalized.append(value)
        return normalized

    def topic_strings(self, row):
        to_return = []
        for field in self.fields:
            value = row.get(field)
            if field in ('Other', 'Other (Keywords)'):
                values = self.normalize_topics(
                    priority_split(value, ';', ','))
                to_return.extend(values)
            elif value:
                to_return.append(field.replace("(Keywords)", "").strip())
        return to_return

    def topics(self, row):
        for topic in self.topic_strings(row):
            if topic not in self.cache:
                self.cache[topic] = Topic.objects.get_or_create(name=topic)[0]
            yield self.cache[topic]


class RowProcessor:
    """Creates Requirement objects, Policies, and Topic connections,
    raising exceptions if something goes wrong with the process."""
    def __init__(self, topics=None):
        self.policies = PolicyProcessor()
        if topics is None:
            topics = []
        self.topic_proc = TopicProcessor(topics)
        self.req_ids = set()
        self.last_id = "0.0"

    def validate_requirement_id(self, reqid):
        if reqid in ('', 'N/A', 'NA', 'None'):
            raise ValueError("Requirement without ID")
        reqid = reqid.replace(",", ".")  # Fix stray commas.
        reqid = self.fix_excel_decimals(reqid)
        if reqid in self.req_ids:
            raise ValueError("Duplicated requirement ID: {0}".format(reqid))
        return reqid

    def fix_excel_decimals(self, reqid):
        """
        Excel strips trailing zeroes, so for example what should be 1.20 is 1.2
        in the data.
        Since the rows are sequential (or should be!), we should be able to
        account for this.
        """
        while reqid.endswith("."):  # Handle a hack around Excel problems
            reqid = reqid.rstrip(".")
        if "." not in reqid:
            raise ValueError(
                "Requirement ID without . separator: {0}".format(reqid))
        policy, requirement = reqid.split(".")
        last_policy, last_requirement = self.last_id.split(".")
        if policy == last_policy and last_requirement.endswith("9"):
            sequential = str(int(last_requirement) + 1)
            if sequential.rstrip("0") == requirement:
                reqid = "{0}.{1}".format(policy, sequential)
        # The most common Excel failure not addressed above is stripping
        # zeroes, and we're going to live with possibly assigning 6.10 and
        # 6.100 to the wrong ones of two "6.1" values in the data.
        while reqid in self.req_ids:
            reqid = "{0}0".format(reqid)
        return reqid

    def add(self, row):
        req_key = find_key("req_ids", row)
        req_id = self.validate_requirement_id(row[req_key])
        row = handle_transposed_reqstatus(row)
        verb_key = find_key("verbs", row)
        impacted_key = find_key("entities", row)
        citation_key = find_key("citations", row)

        params = dict(
            citation=row[citation_key],
            impacted_entity=row[impacted_key],
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
        req.topics.set(list(self.topic_proc.topics(row)))
        self.req_ids.add(req_id)
        self.last_id = req_id


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
        # We think that any columns after "Citation " will be topic columns.
        citation_key = find_key("citations", {k: "" for k in data.fieldnames})
        topics = data.fieldnames[data.fieldnames.index(citation_key) + 1:]
        rows = RowProcessor(topics)
        for idx, row in enumerate(data):
            if options['status'] and idx % options['status'] == 0:
                logger.info('Processed %s rows', idx)
            try:
                rows.add(row)
            except ValueError as err:
                logger.warning("Problem with row %s: %s", idx + 1, err)
