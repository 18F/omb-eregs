import argparse
import logging

from django.core.management.base import BaseCommand
from lxml import etree

from document.models import DocNode
from reqs.models import Policy

logger = logging.getLogger(__name__)


def fetch_policy(identifier: str):
    if identifier.isdigit():
        return Policy.objects.filter(pk=identifier).first()
    else:
        return Policy.objects.filter(omb_policy_id=identifier).first()


def import_xml_doc(policy: Policy, xml: etree.ElementBase):
    DocNode.objects.filter(policy=policy).delete()

    root = convert_to_tree(xml, policy=policy)
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())
    logger.info('Created %s nodes for %s', root.subtree_size(),
                policy.title_with_number)


def convert_to_tree(xml_node, parent=None, **kwargs):
    cursor_args = {
        'node_type': xml_node.tag,
        'text': (xml_node.text or '').strip(),
        **kwargs,
    }
    if 'emblem' in xml_node.attrib:
        cursor_args['type_emblem'] = xml_node.attrib['emblem']
    if parent:
        cursor = parent.add_child(**cursor_args)
    else:
        cursor = DocNode.new_tree(**cursor_args)

    for xml_child in xml_node:
        convert_to_tree(xml_child, cursor, **kwargs)

    return cursor


class Command(BaseCommand):
    help = (  # noqa
    """
        Import a loosely structured XML document that follows a few
        assumptions:
        1. XML tags indicate node type
        2. an "emblem" attribute per tag indicates type_emblem (not required)
        3. Text within a tag will be stripped; it must come before any
        sub-tags
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
