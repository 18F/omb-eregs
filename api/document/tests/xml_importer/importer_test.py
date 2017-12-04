import pytest
from lxml import etree
from model_mommy import mommy

from document.models import DocNode
from document.tree import DocCursor
from document.xml_importer import importer
from reqs.models import Policy


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

    root = importer.import_xml_doc(policy, xml)
    assert DocNode.objects.count() == 4
    root_model = DocNode.objects.get(identifier='aroot_1')
    root = DocCursor.load_from_model(root_model)
    assert root['subchild_b'].text == 'Contents'
    assert root['subchild_2']['subsubchild_1'].node_type == 'subsubchild'


@pytest.mark.parametrize('xml_str, expected_emblem', [
    ('<someroot />', '1'),
    ('<someroot emblem="G" />', 'G'),
])
def test_convert_to_tree_root_emblems(xml_str, expected_emblem):
    xml = etree.fromstring(xml_str)
    result = importer.convert_to_tree(xml)
    assert result.type_emblem == expected_emblem


def test_convert_to_tree_marker():
    xml = etree.fromstring('<some_el marker="(1)" />')
    result = importer.convert_to_tree(xml)
    assert result.marker == '(1)'


def test_convert_to_tree_xml():
    xml = etree.fromstring("""
    <root>
        <achild>
            <subchild/>
        </achild>
    </root>
    """)
    root = importer.convert_to_tree(xml)
    assert root.xml_node.tag == 'root'
    assert root['achild_1'].xml_node.tag == 'achild'
    assert root['achild_1']['subchild_1'].xml_node.tag == 'subchild'


def test_content_text():
    xml = etree.fromstring("""
    <element>
        <content>Has <a>linked</a> text <strong>here</strong> there</content>
    </element>
    """)
    expected = "Has linked text here there"
    assert importer.content_text(xml) == expected


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
    assert importer.content_text(xml) == ''
