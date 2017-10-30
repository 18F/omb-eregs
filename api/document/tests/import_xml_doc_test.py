from unittest.mock import Mock

import pytest
from lxml import etree
from model_mommy import mommy

from document.management.commands import import_xml_doc
from document.models import DocNode, FootnoteCitation, PlainText
from document.tests.utils import random_doc
from document.tree import DocCursor, XMLAwareCursor
from reqs.models import Policy


@pytest.mark.django_db
def test_fetch_policy_pk():
    policy = mommy.make(Policy)
    assert import_xml_doc.fetch_policy(f"{policy.pk}") == policy


@pytest.mark.django_db
def test_fetch_policy_number():
    policy = mommy.make(Policy, omb_policy_id='M-12-13')
    assert import_xml_doc.fetch_policy('M-12-13') == policy


@pytest.mark.django_db
def test_import_xml_doc():
    policy = mommy.make(Policy)
    xml = etree.fromstring("""
    <aroot>
        <subchild emblem="b">
            <content>Contents</content>
        </subchild>
        <subchild>
            <content>Subchild 2 here</content>
            <subsubchild />
        </subchild>
    </aroot>
    """)

    root = import_xml_doc.import_xml_doc(policy, xml)
    assert DocNode.objects.count() == 4
    root_model = DocNode.objects.get(identifier='aroot_1')
    root = DocCursor.load_from_model(root_model)
    assert root['subchild_b'].model.text == 'Contents'
    assert root['subchild_2']['subsubchild_1'].model.node_type == 'subsubchild'


@pytest.mark.parametrize('xml_str, expected_emblem', [
    ('<someroot />', '1'),
    ('<someroot emblem="G" />', 'G'),
])
def test_convert_to_tree_root_emblems(xml_str, expected_emblem):
    xml = etree.fromstring(xml_str)
    result = import_xml_doc.convert_to_tree(xml)
    assert result.model.type_emblem == expected_emblem


def test_convert_to_tree_xml():
    xml = etree.fromstring("""
    <root>
        <achild>
            <subchild/>
        </achild>
    </root>
    """)
    root = import_xml_doc.convert_to_tree(xml)
    assert root.xml_node.tag == 'root'
    assert root['achild_1'].xml_node.tag == 'achild'
    assert root['achild_1']['subchild_1'].xml_node.tag == 'subchild'


def test_standardize_content():
    aroot = etree.fromstring("""
    <aroot>
        <childA>More text </childA>
        <childB>
            <content>Already exists</content>
            <innerMost />
        </childB>
        <childC>
            Something else
        </childC>
    </aroot>
    """)
    import_xml_doc.standardize_content(aroot)
    assert aroot.findtext('./childA') == ''
    assert aroot.findtext('./childA/content') == 'More text '
    assert aroot.findtext('./childB/content') == 'Already exists'
    assert aroot.findtext('./childB/innerMost') == ''
    assert aroot.find('./childB/innerMost/content') is None
    assert aroot.findtext('./childC') == ''
    assert aroot.findtext('./childC/content').strip() == 'Something else'


def test_clean_content():
    aroot = etree.fromstring("""
    <aroot>
        <content> Some text <br />   </content>
        <childA>
            <content>
                More    text
            </content>
        </childA>
        <childB />
    </aroot>
    """)
    import_xml_doc.clean_content(aroot)
    assert aroot.findtext('./childA/content') == 'More    text'
    content_xml = etree.tounicode(aroot.find('./content')).strip()
    assert content_xml == '<content>Some text <br/></content>'


def test_content_text():
    xml = etree.fromstring("""
    <element>
        <content>Has <a>linked</a> text <strong>here</strong> there</content>
    </element>
    """)
    expected = "Has linked text here there"
    assert import_xml_doc.content_text(xml) == expected


def test_content_text_no_content():
    """When there is no immediate <content/> subchild, we shouldn't dive
    deeper"""
    xml = etree.fromstring("""
    <element>
        <subelement>
            <content>Stuff</content>
        </subelement>
    </element>
    """)
    assert import_xml_doc.content_text(xml) == ''


@pytest.mark.django_db
def test_footnote_annotations():
    policy = mommy.make(Policy)
    xml_span = etree.fromstring("<footnote_citation> 1  </footnote_citation>")
    root = DocCursor.new_tree('sect', '2', policy=policy)
    for _ in range(8):
        root.add_child('para', policy=policy)
    root['para_2'].add_child('footnote', '3', policy=policy)  # not 1
    root['para_4'].add_child('footnote', '1', policy=policy)  # is 1
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())

    result = import_xml_doc.AnnotationHandler.footnote_citation(
        root, xml_span, 4)
    assert result is not None
    assert result.doc_node == root.model
    assert result.start == 4
    assert result.end == 4 + len(' 1  ')
    assert result.footnote_node == root['para_4']['footnote_1'].model


def test_footnote_annotations_missing(monkeypatch):
    monkeypatch.setattr(import_xml_doc.logger, 'warning', Mock())
    xml_span = etree.fromstring("<footnote_citation> 1  </footnote_citation>")
    root = DocCursor.new_tree('sect', '2')
    for _ in range(8):
        root.add_child('para')
    root['para_2'].add_child('footnote', '3')  # not 1

    result = import_xml_doc.AnnotationHandler.footnote_citation(
        root, xml_span, 4)
    assert result is None
    assert import_xml_doc.logger.warning.called


def test_content_xml_annotations(monkeypatch):
    """Passes the correct string indexes and annotations along."""
    monkeypatch.setattr(import_xml_doc, 'AnnotationHandler',
                        Mock(spec_set=['aaa', 'bbb']))
    xml = etree.fromstring(
        # being careful about whitespace
        "<content>Some <aaa>span</aaa> of <bbb>text</bbb> here "
        "<nonono>there</nonono>:<empty />!</content>")
    result = list(import_xml_doc.content_xml_annotations(xml, Mock()))
    assert result == [import_xml_doc.AnnotationHandler.aaa.return_value,
                      import_xml_doc.AnnotationHandler.bbb.return_value]

    aaa_call = import_xml_doc.AnnotationHandler.aaa.call_args[0]
    assert aaa_call[1].tag == 'aaa'
    assert aaa_call[2] == len('Some ')

    bbb_call = import_xml_doc.AnnotationHandler.bbb.call_args[0]
    assert bbb_call[1].tag == 'bbb'
    assert bbb_call[2] == len('Some span of ')


def test_derive_annotations(monkeypatch):
    """Recursively derives annotation objects."""
    monkeypatch.setattr(import_xml_doc, 'content_xml_annotations', Mock())
    import_xml_doc.content_xml_annotations.side_effect = [
        [FootnoteCitation(start=0), PlainText(start=1), PlainText(start=2)],
        [],
        [PlainText(start=3), FootnoteCitation(start=4)],
    ]
    root = random_doc(6, cls=XMLAwareCursor)
    for idx, node in enumerate(root.walk()):
        node.xml_node = Mock()
        if idx % 2 == 0:    # Half won't have content
            node.xml_node.find.return_value = None

    result = import_xml_doc.derive_annotations(root)
    assert set(result.keys()) == {FootnoteCitation, PlainText}
    assert {anote.start for anote in result[FootnoteCitation]} == {0, 4}
    assert {anote.start for anote in result[PlainText]} == {1, 2, 3}
