from unittest.mock import Mock

import pytest
from lxml import etree
from model_mommy import mommy

from document.models import DocNode, FootnoteCitation, PlainText
from document.tests.utils import random_doc
from document.tree import DocCursor, XMLAwareCursor
from document.xml_importer import annotations
from reqs.models import Policy


@pytest.mark.django_db
def test_footnote_annotations():
    policy = mommy.make(Policy)
    xml_span = etree.fromstring("<footnote_citation> 1  </footnote_citation>")
    root = DocCursor.new_tree('sect', '2', policy=policy)
    for _ in range(8):
        root.add_child('para')
    root['para_2'].add_child('footnote', '3')  # not 1
    root['para_4'].add_child('footnote', '1')  # is 1
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())

    result = annotations.AnnotationHandler.footnote_citation(
        root, xml_span, 4)
    assert result is not None
    assert result.doc_node == root.model
    assert result.start == 4
    assert result.end == 4 + len(' 1  ')
    assert result.footnote_node == root['para_4']['footnote_1'].model


def test_footnote_annotations_missing(monkeypatch):
    monkeypatch.setattr(annotations.logger, 'warning', Mock())
    xml_span = etree.fromstring("<footnote_citation> 1  </footnote_citation>")
    root = DocCursor.new_tree('sect', '2')
    for _ in range(8):
        root.add_child('para')
    root['para_2'].add_child('footnote', '3')  # not 1

    result = annotations.AnnotationHandler.footnote_citation(
        root, xml_span, 4)
    assert result is None
    assert annotations.logger.warning.called


def test_content_xml_annotations(monkeypatch):
    """Passes the correct string indexes and annotations along."""
    monkeypatch.setattr(annotations, 'AnnotationHandler',
                        Mock(spec_set=['aaa', 'bbb']))
    xml = etree.fromstring(
        # being careful about whitespace
        "<content>Some <aaa>span</aaa> of <bbb>text</bbb> here "
        "<nonono>there</nonono>:<empty />!</content>")
    result = list(annotations.content_xml_annotations(xml, Mock()))
    assert result == [annotations.AnnotationHandler.aaa.return_value,
                      annotations.AnnotationHandler.bbb.return_value]

    aaa_call = annotations.AnnotationHandler.aaa.call_args[0]
    assert aaa_call[1].tag == 'aaa'
    assert aaa_call[2] == len('Some ')

    bbb_call = annotations.AnnotationHandler.bbb.call_args[0]
    assert bbb_call[1].tag == 'bbb'
    assert bbb_call[2] == len('Some span of ')


def test_derive_annotations(monkeypatch):
    """Recursively derives annotation objects."""
    monkeypatch.setattr(annotations, 'content_xml_annotations', Mock())
    annotations.content_xml_annotations.side_effect = [
        [FootnoteCitation(start=0), PlainText(start=1), PlainText(start=2)],
        [],
        [PlainText(start=3), FootnoteCitation(start=4)],
    ]
    root = random_doc(6, cls=XMLAwareCursor)
    for idx, node in enumerate(root.walk()):
        node.xml_node = Mock()
        if idx % 2 == 0:    # Half won't have content
            node.xml_node.find.return_value = None

    result = annotations.derive_annotations(root)
    assert set(result.keys()) == {FootnoteCitation, PlainText}
    assert {anote.start for anote in result[FootnoteCitation]} == {0, 4}
    assert {anote.start for anote in result[PlainText]} == {1, 2, 3}
