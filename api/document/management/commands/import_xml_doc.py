import argparse
import logging

from django.core.management.base import BaseCommand
from lxml import etree

from document.xml_importer.importer import import_xml_doc
from reqs.models import Policy

logger = logging.getLogger(__name__)


def fetch_policy(identifier: str):
    if identifier.isdigit():
        return Policy.objects.filter(pk=identifier).first()
    else:
        return Policy.objects.filter(omb_policy_id=identifier).first()


class Command(BaseCommand):
    help = (  # noqa
    """
        Import a loosely structured XML document that follows a few
        assumptions:
        1. XML tags indicate node type
        2. an "emblem" attribute per tag indicates type_emblem (not required)
        3. Node text can appear in two forms: as plain text before any child
           tags or in a <content> sub-tag. Both forms will be stripped of
           initial and trailing whitespace.
        4. Within the <content> tag, we can expect indications of inline
           information, including:
           * footnote_citation: we expect it to wrap the referent footnote.
    """)

    def add_arguments(self, parser):
        parser.add_argument('INPUT_FILE', type=argparse.FileType('rb'))
        parser.add_argument('POLICY', help='Policy id or number to associate')

    def handle(self, *args, **kwargs):
        policy = fetch_policy(kwargs['POLICY'])
        if not policy:
            logger.warning('No such policy, %s', kwargs['POLICY'])
        else:
            xml = etree.parse(kwargs['INPUT_FILE']).getroot()
            import_xml_doc(policy, xml)
