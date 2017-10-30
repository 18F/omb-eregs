import argparse
import logging
from collections import defaultdict
from typing import Dict, List, Optional, Type

from django.core.management.base import BaseCommand
from lxml import etree

from document.models import Annotation, DocNode, FootnoteCitation
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
    annotations_by_cls = derive_annotations(root)
    for cls, annotations in annotations_by_cls.items():
        cls.objects.bulk_create(annotations)
        logger.info('Created %s %ss', len(annotations), cls)


class AnnotationHandler:
    """Collection of functions to convert XML spans into Annotations in a
    single namespace."""
    @staticmethod
    def footnote_citation(cursor: XMLAwareCursor, xml_span: etree.ElementBase,
                          start: int) -> Optional[FootnoteCitation]:
        text = ''.join(xml_span.itertext())
        referencing = list(cursor.filter(
            lambda m: m.node_type == 'footnote'
            and m.type_emblem == text.strip()
        ))
        print(referencing)
        if referencing:
            return FootnoteCitation(
                doc_node=cursor.model, start=start, end=start + len(text),
                footnote_node=referencing[0].model,
            )
        else:
            logger.warning("Can't find footnote: %s", repr(text))


def content_xml_annotations(
        content_xml: etree.ElementBase, cursor: XMLAwareCursor):
    """Derive all annotations from a <content/> tag, tracking their start/end
    position in the original string."""
    len_so_far = len(content_xml.text or '')
    for child_xml in content_xml:
        if hasattr(AnnotationHandler, child_xml.tag):
            annotation = getattr(AnnotationHandler, child_xml.tag)(
                cursor, child_xml, len_so_far)
            if annotation:
                yield annotation
        len_so_far += sum(len(txt) for txt in child_xml.itertext())
        len_so_far += len(child_xml.tail or '')


def derive_annotations(
        cursor: XMLAwareCursor) -> Dict[Type, List[Annotation]]:
    content_xml = cursor.xml_node.find('./content')
    annotations_by_cls = defaultdict(list)
    if content_xml is not None:
        for annotation in content_xml_annotations(content_xml, cursor):
            annotations_by_cls[annotation.__class__].append(annotation)

    for child_cursor in cursor.children():
        for cls, annotations in derive_annotations(child_cursor).items():
            annotations_by_cls[cls].extend(annotations)

    return annotations_by_cls


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
