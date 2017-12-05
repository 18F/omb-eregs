import logging
from collections import defaultdict
from typing import Dict, List, Optional, Type

from lxml import etree

from document.models import (Annotation, Cite, ExternalLink, FootnoteCitation,
                             InlineRequirement)
from document.tree import XMLAwareCursor
from reqs.models import Requirement

logger = logging.getLogger(__name__)


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


def anchor(cursor: XMLAwareCursor, xml_span: etree.ElementBase,
           start: int) -> Optional[ExternalLink]:
    text = ''.join(xml_span.itertext())
    href = xml_span.attrib.get('href', text)
    return ExternalLink(doc_node=cursor.model, start=start,
                        end=start + len(text), href=href)


def requirement(cursor: XMLAwareCursor, xml_span: etree.ElementBase,
                start: int) -> Optional[InlineRequirement]:
    text = ''.join(xml_span.itertext())
    req_id = xml_span.attrib.get('id', '')
    req = Requirement.objects.filter(req_id=req_id).first()
    if req:
        return InlineRequirement(
            doc_node=cursor.model, start=start, end=start + len(text),
            requirement=req
        )
    else:
        logger.warning("Can't find requirement: %s", repr(req_id))


def cite(cursor: XMLAwareCursor, xml_span: etree.ElementBase,
         start: int) -> Optional[ExternalLink]:
    text = ''.join(xml_span.itertext())
    return Cite(doc_node=cursor.model, start=start,
                end=start + len(text))


def noop_handler(cursor, xml_span, start):
    pass


annotation_mapping = defaultdict(
    lambda: noop_handler,
    cite=cite,
    footnote_citation=footnote_citation,
    a=anchor,
    req=requirement,
)


def len_of_child_text(xml_node: etree.ElementBase):
    return sum(len(txt) for txt in xml_node.itertext())


class AnnotationDeriver:
    """Recursively derives annotations. This is a class to keep track of the
    start position within the original string."""
    def __init__(self, cursor: XMLAwareCursor):
        self.len_so_far = 0
        self.cursor = cursor

    def derive(self, xml: etree.ElementBase):
        intro_text = xml.text or ''
        self.len_so_far += len(intro_text)
        for child_xml in xml:
            handler = annotation_mapping[child_xml.tag]
            annotation = handler(self.cursor, child_xml, self.len_so_far)
            if annotation:
                yield annotation
            yield from self.derive(child_xml)
            self.len_so_far += len(child_xml.tail or '')


def derive_annotations(
        cursor: XMLAwareCursor) -> Dict[Type, List[Annotation]]:
    content_xml = cursor.xml_node.find('./content')
    annotations_by_cls = defaultdict(list)
    if content_xml is not None:
        for annotation in AnnotationDeriver(cursor).derive(content_xml):
            annotations_by_cls[annotation.__class__].append(annotation)

    for child_cursor in cursor.children():
        for cls, annotations in derive_annotations(child_cursor).items():
            annotations_by_cls[cls].extend(annotations)

    return annotations_by_cls
