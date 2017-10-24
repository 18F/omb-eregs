import pytest
from lxml import etree
from model_mommy import mommy

from document.management.commands import import_xml_doc
from document.models import DocNode
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
            Contents
        </subchild>
        <subchild>
            Subchild 2 here
            <subsubchild />
        </subchild>
    </aroot>
    """)

    import_xml_doc.import_xml_doc(policy, xml)
    assert DocNode.objects.count() == 4
    root = DocNode.objects.get(identifier='aroot_1').subtree()
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
