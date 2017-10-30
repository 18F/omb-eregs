import logging
from collections import defaultdict
from typing import Dict, List, Optional, Type

from lxml import etree

from document.models import Annotation, FootnoteCitation
from document.tree import XMLAwareCursor

logger = logging.getLogger(__name__)


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
