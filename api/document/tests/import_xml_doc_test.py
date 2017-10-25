import pytest
from lxml import etree
from model_mommy import mommy

from document.management.commands import import_xml_doc
from document.models import DocNode
from document.tree import DocCursor
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

    import_xml_doc.import_xml_doc(policy, xml)
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
