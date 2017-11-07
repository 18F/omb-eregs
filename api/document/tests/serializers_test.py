from datetime import date
from unittest.mock import Mock

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

    result = serializers.DocCursorSerializer(root,
                                             context={'policy': policy}).data
    assert result == {
        'identifier': 'root_0',
        'node_type': 'root',
        'type_emblem': '0',
        'text': '',
        'marker': '',
        'depth': 0,
        'content': [],
        'meta': {
            'descendant_footnotes': [],
            'policy': {     # Note this field does not appear on children
                'issuance': '2001-02-03',
                'omb_policy_id': 'M-18-18',
                'original_url': 'http://example.com/thing.pdf',
                'title': 'Some Title',
            },
            'requirement': None,
        },
        'children': [
            {
                'identifier': 'root_0__sect_1',
                'node_type': 'sect',
                'type_emblem': '1',
                'text': 'Section 1',
                'marker': '',
                'depth': 1,
                'meta': {'requirement': None},
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
                'meta': {'requirement': None},
                'content': [],
                'children': [
                    {
                        'identifier': 'root_0__sect_2__par_a',
                        'node_type': 'par',
                        'type_emblem': 'a',
                        'text': '',
                        'marker': '(a)',
                        'depth': 2,
                        'meta': {'requirement': None},
                        'content': [],
                        'children': [
                            {
                                'identifier': 'root_0__sect_2__par_a__par_1',
                                'node_type': 'par',
                                'type_emblem': '1',
                                'text': 'Paragraph (a)(1)',
                                'marker': '(1)',
                                'depth': 3,
                                'meta': {'requirement': None},
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
                        'meta': {'requirement': None},
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
    root = DocCursor.new_tree('policy', policy=policy)
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

    result = serializers.DocCursorSerializer(root,
                                             context={'policy': policy}).data
    assert result['meta']['requirement'] is None
    child_node = result['children'][0]
    assert child_node['meta']['requirement'] == {
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
def test_footnote_citations():
    """The "content" field should contain serialized FootnoteCitations."""
    policy = mommy.make(Policy)
    para = DocCursor.new_tree('para', text='Some1 message2 here',
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

    result = serializers.DocCursorSerializer(para,
                                             context={'policy': policy}).data
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


@pytest.mark.parametrize('node_type', ('para', 'table', 'something-else'))
@pytest.mark.parametrize('is_root', (True, False))
def test_descendant_footnotes_meta(monkeypatch, node_type, is_root):
    """Only the root and "table" nodes should get descendant_foonotes."""
    monkeypatch.setattr(serializers, 'descendant_footnotes',
                        Mock(return_value=['some', 'footnotes']))
    node = DocCursor.new_tree(node_type)
    result = serializers.DocCursorSerializer(
        node, context={'policy': mommy.prepare(Policy), 'is_root': is_root}
    ).data
    if node_type == 'table' or is_root:
        assert result['meta']['descendant_footnotes'] == ['some', 'footnotes']
    else:
        assert 'descendant_footnotes' not in result['meta']


@pytest.mark.django_db
def test_descendant_footnotes():
    """We pull out footnotes of all descendants, and only descendants."""
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', policy=policy)
    ftnt_a = root.add_child('footnote', 'a')
    root.add_child('para')
    ftnt_b = root['para_1'].add_child('footnote', 'b')
    root.add_child('list')
    root['list_1'].add_child('para')
    root['list_1'].add_child('para')
    root['list_1'].add_child('para')
    ftnt_c = root['list_1']['para_3'].add_child('footnote', 'c')
    root.nested_set_renumber()
    DocNode.objects.bulk_create(node.model for node in root.walk())

    root['para_1'].model.footnotecitations.create(
        start=0, end=1, footnote_node=ftnt_a.model)
    root['para_1'].model.footnotecitations.create(
        start=1, end=2, footnote_node=ftnt_b.model)
    root['list_1']['para_2'].model.footnotecitations.create(
        start=0, end=1, footnote_node=ftnt_c.model)

    def fts(cursor):
        result = serializers.descendant_footnotes(cursor)
        return [node['identifier'] for node in result]

    assert fts(root) == ['root_1__footnote_a', 'root_1__para_1__footnote_b',
                         'root_1__list_1__para_3__footnote_c']
    assert fts(root['footnote_a']) == []
    assert fts(root['para_1']) == ['root_1__footnote_a',
                                   'root_1__para_1__footnote_b']
    assert fts(root['list_1']) == ['root_1__list_1__para_3__footnote_c']
    assert fts(root['list_1']['para_2']) == [
        'root_1__list_1__para_3__footnote_c']
    # no citations in para 3
    assert fts(root['list_1']['para_3']) == []
