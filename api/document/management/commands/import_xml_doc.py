import argparse
import logging

from django.core.management.base import BaseCommand
from lxml import etree

from document.models import DocNode
from document.tree import XMLAwareCursor
from reqs.models import Policy

logger = logging.getLogger(__name__)


def fetch_policy(identifier: str):
    if identifier.isdigit():
        return Policy.objects.filter(pk=identifier).first()
    else:
        return Policy.objects.filter(omb_policy_id=identifier).first()


def standardize_content(xml: etree.ElementBase):
    """For ease of use, we don't require all text be wrapped in a "content"
    tag. However, that idiom _is_ helpful when parsing, so let's add them
    here."""
    for element in xml.xpath('.//*[not(self::content) and not(./content)]'):
        if element.text:
            content_xml = etree.SubElement(element, 'content')
            content_xml.text = element.text
        element.text = None


def clean_content(xml: etree.ElementBase):
    """Remove beginning and trailing whitespace from <content> tags."""
    for content_xml in xml.xpath('.//content'):
        content_xml.text = (content_xml.text or '').lstrip()
        last_child = content_xml.xpath('./*[last()]')
        if last_child:
            last_child = last_child[0]
            last_child.tail = (last_child.tail or '').rstrip()
        else:
            content_xml.text = content_xml.text.rstrip()


def import_xml_doc(policy: Policy, xml: etree.ElementBase):
    DocNode.objects.filter(policy=policy).delete()
    standardize_content(xml)
    clean_content(xml)

    root = convert_to_tree(xml, policy=policy)
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())
    logger.info('Created %s nodes for %s', root.subtree_size(),
                policy.title_with_number)


def content_text(xml_node: etree.ElementBase):
    """Fetch just the text from a node. We'll assume it's been preprocessed to
    have a single <content/> child."""
    content_node = xml_node.find('./content')
    if content_node is None:
        return ''
    else:
        return ''.join(content_node.itertext())


def convert_to_tree(xml_node: etree.ElementBase, parent=None,
                    **kwargs) -> XMLAwareCursor:
    cursor_args = {
        'node_type': xml_node.tag,
        'text': content_text(xml_node),
        **kwargs,
    }
    if 'emblem' in xml_node.attrib:
        cursor_args['type_emblem'] = xml_node.attrib['emblem']
    if parent:
        cursor = parent.add_child(**cursor_args)
    else:
        cursor = XMLAwareCursor.new_tree(**cursor_args)
    cursor.xml_node = xml_node

    for xml_child in xml_node.xpath('./*[not(self::content)]'):
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
