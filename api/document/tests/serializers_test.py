from datetime import date

import pytest
from model_mommy import mommy

from document import serializers
from document.models import DocNode
from document.tree import DocCursor
from reqs.models import Policy, Requirement, Topic


def test_end_to_end():
    """Create a tree, then serialize it."""
    policy = mommy.prepare(
        Policy, issuance=date(2001, 2, 3), omb_policy_id='M-18-18',
        title='Some Title', uri='http://example.com/thing.pdf',
    )
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.add_child('sect', text='Section 1')
    sect2 = root.add_child('sect')
    pa = sect2.add_child('par', 'a', marker='(a)')
    pa.add_child('par', '1', text='Paragraph (a)(1)', marker='(1)')
    sect2.add_child('par', 'b', marker='b.')

    result = serializers.DocCursorSerializer(root).data
    assert result == {
        'identifier': 'root_0',
        'node_type': 'root',
        'type_emblem': '0',
        'text': '',
        'marker': '',
        'depth': 0,
        'requirement': None,
        'content': [],
        'policy': {     # Note this field does not appear on children
            'issuance': '2001-02-03',
            'omb_policy_id': 'M-18-18',
            'original_url': 'http://example.com/thing.pdf',
            'title': 'Some Title',
        },
        'children': [
            {
                'identifier': 'root_0__sect_1',
                'node_type': 'sect',
                'type_emblem': '1',
                'text': 'Section 1',
                'marker': '',
                'depth': 1,
                'requirement': None,
                'content': [{
                    'content_type': '__text__',
                    'text': 'Section 1',
                }],
                'children': [],
            },
            {
                'identifier': 'root_0__sect_2',
                'node_type': 'sect',
                'type_emblem': '2',
                'text': '',
                'marker': '',
                'depth': 1,
                'requirement': None,
                'content': [],
                'children': [
                    {
                        'identifier': 'root_0__sect_2__par_a',
                        'node_type': 'par',
                        'type_emblem': 'a',
                        'text': '',
                        'marker': '(a)',
                        'depth': 2,
                        'requirement': None,
                        'content': [],
                        'children': [
                            {
                                'identifier': 'root_0__sect_2__par_a__par_1',
                                'node_type': 'par',
                                'type_emblem': '1',
                                'text': 'Paragraph (a)(1)',
                                'marker': '(1)',
                                'depth': 3,
                                'requirement': None,
                                'content': [{
                                    'content_type': '__text__',
                                    'text': 'Paragraph (a)(1)',
                                }],
                                'children': [],
                            },
                        ],
                    },
                    {
                        'identifier': 'root_0__sect_2__par_b',
                        'node_type': 'par',
                        'type_emblem': 'b',
                        'text': '',
                        'marker': 'b.',
                        'depth': 2,
                        'requirement': None,
                        'content': [],
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
    root = DocCursor.new_tree('policy', '1', policy=policy)
    req_node = root.add_child('req')
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


@pytest.mark.django_db
def test_footnotes():
    """The "content" field should contain serialized FootnoteCitations."""
    policy = mommy.make(Policy)
    para = DocCursor.new_tree('para', '1', text='Some1 message2 here',
                              policy=policy)
    footnote1 = para.add_child('footnote').model
    footnote2 = para.add_child('footnote').model
    para.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in para.walk())
    para.model.footnotecitations.create(
        start=len('Some'), end=len('Some1'), footnote_node=footnote1)
    para.model.footnotecitations.create(
        start=len('Some1 message'), end=len('Some1 message2'),
        footnote_node=footnote2)

    result = serializers.DocCursorSerializer(para).data
    assert result['content'] == [
        {
            'content_type': '__text__',
            'text': 'Some',
        }, {
            'content_type': 'footnote_citation',
            'text': '1',
            'footnote_node': footnote1.identifier,
        }, {
            'content_type': '__text__',
            'text': ' message',
        }, {
            'content_type': 'footnote_citation',
            'text': '2',
            'footnote_node': footnote2.identifier,
        }, {
            'content_type': '__text__',
            'text': ' here',
        }
    ]
