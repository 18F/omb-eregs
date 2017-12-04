from unittest.mock import Mock

import pytest
from lxml import etree
from model_mommy import mommy

from document.models import FootnoteCitation, PlainText
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

    result = annotations.footnote_citation(root, xml_span, 4)
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

    result = annotations.footnote_citation(root, xml_span, 4)
    assert result is None
    assert annotations.logger.warning.called


def test_anchor_with_href():
    xml_span = etree.fromstring("""
        <a href="http://example.com/path">Some where</a>
    """)

    result = annotations.anchor(random_doc(), xml_span, 2)
    assert result is not None
    assert result.start == 2
    assert result.end == 2 + len('Some where')
    assert result.href == 'http://example.com/path'


def test_anchor_without_href():
    xml_span = etree.fromstring("<a>http://example.com/thing</a>")

    result = annotations.anchor(random_doc(), xml_span, 2)
    assert result is not None
    assert result.start == 2
    assert result.end == 2 + len('http://example.com/thing')
    assert result.href == 'http://example.com/thing'


def test_annotation_deriver(monkeypatch):
    """Passes the correct string indexes and annotations along."""
    aaa, bbb = Mock(), Mock()
    monkeypatch.setitem(annotations.annotation_mapping, 'aaa', aaa)
    monkeypatch.setitem(annotations.annotation_mapping, 'bbb', bbb)
    xml = etree.fromstring(
        # being careful about whitespace
        "<content>Some <aaa>span</aaa> of <bbb>text</bbb> here "
        "<nonono>there</nonono>:<empty />!</content>")
    result = list(annotations.AnnotationDeriver(Mock())(xml))
    assert result == [aaa.return_value, bbb.return_value]

    assert aaa.call_args[0][1].tag == 'aaa'
    assert aaa.call_args[0][2] == len('Some ')

    assert bbb.call_args[0][1].tag == 'bbb'
    assert bbb.call_args[0][2] == len('Some span of ')


def test_annotation_deriver_nested(monkeypatch):
    """Annotations can be nested."""
    aaa, bbb = Mock(), Mock()
    monkeypatch.setitem(annotations.annotation_mapping, 'aaa', aaa)
    monkeypatch.setitem(annotations.annotation_mapping, 'bbb', bbb)
    xml = etree.fromstring(
        # being careful about whitespace
        "<content>Some <aaa>span of <bbb>text</bbb> here</aaa></content>")
    result = list(annotations.AnnotationDeriver(Mock())(xml))
    assert result == [aaa.return_value, bbb.return_value]

    assert aaa.call_args[0][1].tag == 'aaa'
    assert aaa.call_args[0][2] == len('Some ')

    assert bbb.call_args[0][1].tag == 'bbb'
    assert bbb.call_args[0][2] == len('Some span of ')


def test_derive_annotations(monkeypatch):
    """Recursively derives annotation objects."""
    monkeypatch.setattr(annotations, 'AnnotationDeriver', Mock())
    annotations.AnnotationDeriver.return_value.side_effect = [
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
