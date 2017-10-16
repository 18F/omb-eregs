import pytest
from model_mommy import mommy

from document import serializers
from document.models import DocNode
from reqs.models import Policy, Requirement, Topic


def test_end_to_end():
    """Create a tree, then serialize it."""
    root = DocNode.new_tree('root', '0')
    root.add_child('sect', text='Section 1')
    sect2 = root.add_child('sect')
    pa = sect2.add_child('par', 'a')
    pa.add_child('par', '1', text='Paragraph (a)(1)')
    sect2.add_child('par', 'b')

    result = serializers.DocCursorSerializer(root).data
    assert result == {
        'identifier': 'root_0',
        'node_type': 'root',
        'type_emblem': '0',
        'text': '',
        'depth': 0,
        'requirement': None,
        'children': [
            {
                'identifier': 'root_0__sect_1',
                'node_type': 'sect',
                'type_emblem': '1',
                'text': 'Section 1',
                'depth': 1,
                'requirement': None,
                'children': [],
            },
            {
                'identifier': 'root_0__sect_2',
                'node_type': 'sect',
                'type_emblem': '2',
                'text': '',
                'depth': 1,
                'requirement': None,
                'children': [
                    {
                        'identifier': 'root_0__sect_2__par_a',
                        'node_type': 'par',
                        'type_emblem': 'a',
                        'text': '',
                        'depth': 2,
                        'requirement': None,
                        'children': [
                            {
                                'identifier': 'root_0__sect_2__par_a__par_1',
                                'node_type': 'par',
                                'type_emblem': '1',
                                'text': 'Paragraph (a)(1)',
                                'depth': 3,
                                'requirement': None,
                                'children': [],
                            },
                        ],
                    },
                    {
                        'identifier': 'root_0__sect_2__par_b',
                        'node_type': 'par',
                        'type_emblem': 'b',
                        'text': '',
                        'depth': 2,
                        'requirement': None,
                        'children': [],
                    },
                ],
            },
        ],
    }


@pytest.mark.django_db
def test_requirement():
    """The 'requirement' field should serialize an associated Requirement"""
    policy = mommy.make(Policy)
    topics = [mommy.make(Topic, name='AaA'), mommy.make(Topic, name='BbB')]
    root = DocNode.new_tree('policy', '1', policy=policy)
    req_node = root.add_child('req', policy=policy)
    root.nested_set_renumber()
    root.model.save()
    req_node.model.save()

    req = mommy.make(
        Requirement,
        citation='citcitcit',
        docnode=req_node.model,
        impacted_entity='imp',
        policy=policy,
        policy_section='sectsect',
        policy_sub_section='subsub',
        req_deadline='ded',
        req_id='12.34',
        topics=topics,
        verb='vvvv',
    )
    req_node.model.refresh_from_db()

    result = serializers.DocCursorSerializer(root).data
    assert result['requirement'] is None
    child_node = result['children'][0]
    assert child_node['requirement'] == {
        'citation': 'citcitcit',
        'impacted_entity': 'imp',
        'id': req.id,
        'policy_section': 'sectsect',
        'policy_sub_section': 'subsub',
        'req_deadline': 'ded',
        'req_id': '12.34',
        'topics': [
            {'id': topics[0].id, 'name': 'AaA'},
            {'id': topics[1].id, 'name': 'BbB'},
        ],
        'verb': 'vvvv',
    }
