from datetime import date

import pytest
from model_mommy import mommy
from rest_framework.exceptions import ValidationError

from document.models import DocNode
from document.serializers import doc_cursor
from document.tree import DocCursor
from reqs.models import Policy

from .. import factories as f


@pytest.mark.django_db
def test_end_to_end():
    """Create a tree, then serialize it. Trivially modify the serialized
    value and deserialize it."""
    policy = mommy.make(
        Policy, issuance=date(2001, 2, 3), omb_policy_id='M-18-18',
        title='Some Title', uri='http://example.com/thing.pdf',
    )
    root = DocCursor.new_tree('root', '0', policy=policy, title='Policy A')
    root.add_child('sec', text='Section 1', title='First Section')
    sec2 = root.add_child('sec', title='Section 2')
    pa = sec2.add_child('para', 'a', marker='(a)')
    pa.add_child('para', '1', text='Paragraph (a)(1)', marker='(1)')
    sec2.add_child('para', 'b', marker='b.')
    root.nested_set_renumber()

    result = doc_cursor.DocCursorSerializer(
        root, context={'policy': policy}).data
    assert result == {
        'identifier': 'root_0',
        'node_type': 'root',
        'type_emblem': '0',
        'text': '',
        'title': 'Policy A',
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
                'title_with_number': 'M-18-18: Some Title',
            },
            'table_of_contents': {
                'identifier': 'root_0',
                'title': 'Policy A',
                'children': [
                    {
                        'children': [],
                        'identifier': 'root_0__sec_1',
                        'title': 'First Section',
                    }, {
                        'children': [],
                        'identifier': 'root_0__sec_2',
                        'title': 'Section 2',
                    },
                ],
            },
        },
        'children': [
            {
                'identifier': 'root_0__sec_1',
                'node_type': 'sec',
                'type_emblem': '1',
                'text': 'Section 1',
                'title': 'First Section',
                'marker': '',
                'depth': 1,
                'meta': {},
                'content': [{
                    'content_type': '__text__',
                    'inlines': [],
                    'text': 'Section 1',
                }],
                'children': [],
            },
            {
                'identifier': 'root_0__sec_2',
                'node_type': 'sec',
                'type_emblem': '2',
                'text': '',
                'title': 'Section 2',
                'marker': '',
                'depth': 1,
                'meta': {},
                'content': [],
                'children': [
                    {
                        'identifier': 'root_0__sec_2__para_a',
                        'node_type': 'para',
                        'type_emblem': 'a',
                        'text': '',
                        'title': '',
                        'marker': '(a)',
                        'depth': 2,
                        'meta': {},
                        'content': [],
                        'children': [
                            {
                                'identifier': 'root_0__sec_2__para_a__para_1',
                                'node_type': 'para',
                                'type_emblem': '1',
                                'text': 'Paragraph (a)(1)',
                                'title': '',
                                'marker': '(1)',
                                'depth': 3,
                                'meta': {},
                                'content': [{
                                    'content_type': '__text__',
                                    'inlines': [],
                                    'text': 'Paragraph (a)(1)',
                                }],
                                'children': [],
                            },
                        ],
                    },
                    {
                        'identifier': 'root_0__sec_2__para_b',
                        'node_type': 'para',
                        'type_emblem': 'b',
                        'text': '',
                        'title': '',
                        'marker': 'b.',
                        'depth': 2,
                        'meta': {},
                        'content': [],
                        'children': [],
                    },
                ],
            },
        ],
    }

    result['title'] = 'MODIFIED Policy A'

    val = doc_cursor.DocCursorSerializer().to_internal_value(result)

    new_root = doc_cursor.DocCursorSerializer().update(root, val)

    assert new_root.title == 'MODIFIED Policy A'
    assert new_root.policy.pk == policy.pk


@pytest.mark.django_db
def test_footnote_citations():
    """The "content" field should contain serialized FootnoteCitations."""
    policy = mommy.make(Policy)
    para = DocCursor.new_tree('para', text='Some1 message2 here',
                              policy=policy)
    footnote1 = para.add_child('footnote').model
    footnote2 = para.add_child('footnote').model
    para.nested_set_renumber()
    para.footnotecitations.create(
        start=len('Some'), end=len('Some1'), footnote_node=footnote1)
    para.footnotecitations.create(
        start=len('Some1 message'), end=len('Some1 message2'),
        footnote_node=footnote2)

    result = doc_cursor.DocCursorSerializer(
        para, context={'policy': policy}).data
    assert result['content'] == [
        {
            'content_type': '__text__',
            'inlines': [],
            'text': 'Some',
        }, {
            'content_type': 'footnote_citation',
            'inlines': [{
                'content_type': '__text__',
                'inlines': [],
                'text': '1',
            }],
            'text': '1',
            'footnote_node': doc_cursor.DocCursorSerializer(
                para['footnote_1'],
                context={'policy': policy, 'is_root': False},
            ).data,
        }, {
            'content_type': '__text__',
            'inlines': [],
            'text': ' message',
        }, {
            'content_type': 'footnote_citation',
            'inlines': [{
                'content_type': '__text__',
                'inlines': [],
                'text': '2',
            }],
            'text': '2',
            'footnote_node': doc_cursor.DocCursorSerializer(
                para['footnote_2'],
                context={'policy': policy, 'is_root': False},
            ).data,
        }, {
            'content_type': '__text__',
            'inlines': [],
            'text': ' here',
        }
    ]


@pytest.mark.django_db
def test_external_links():
    """The "content" field should contain serialized ExternalLinks."""
    policy = mommy.make(Policy)
    para = DocCursor.new_tree('para', text='Go over there!',
                              policy=policy)
    para.nested_set_renumber()
    para.externallinks.create(
        start=len('Go over '), end=len('Go over there'),
        href='http://example.com/aaa')

    result = doc_cursor.DocCursorSerializer(para,
                                            context={'policy': policy}).data
    assert result['content'] == [
        {
            'content_type': '__text__',
            'inlines': [],
            'text': 'Go over '
        }, {
            'content_type': 'external_link',
            'inlines': [{
                'content_type': '__text__',
                'inlines': [],
                'text': 'there',
            }],
            'href': 'http://example.com/aaa',
            'text': 'there',
        }, {
            'content_type': '__text__',
            'inlines': [],
            'text': '!',
        }
    ]


@pytest.mark.django_db
def test_content_no_annotations():
    node = mommy.make(DocNode, text='Some text here')
    cursor = DocCursor.load_from_model(node)
    content = doc_cursor.DocCursorSerializer(cursor).data['content']
    assert len(content) == 1
    assert content[0]['text'] == 'Some text here'
    assert content[0]['content_type'] == '__text__'


@pytest.mark.django_db
def test_content_middle_annotation():
    cursor = DocCursor.new_tree(
        'policy', policy=mommy.make(Policy), text='Some text here')
    footnote_cursor = cursor.add_child('child')
    cursor.nested_set_renumber()
    cursor.footnotecitations.create(
        start=len('Some '), end=len('Some text'),
        footnote_node=footnote_cursor.model)
    content = doc_cursor.DocCursorSerializer(cursor).data['content']

    assert len(content) == 3
    assert [c['text'] for c in content] == ['Some ', 'text', ' here']
    assert [c['content_type'] for c in content] == [
        '__text__', 'footnote_citation', '__text__',
    ]
    assert content[1]['footnote_node'] == doc_cursor.DocCursorSerializer(
        footnote_cursor, context={'is_root': False}).data


@pytest.mark.django_db
def test_content_outside():
    node = mommy.make(DocNode, text='Some text here')
    node.externallinks.create(start=0, end=len('Some '),
                              href='http://example.com/aaa')
    node.externallinks.create(
        start=len('Some text'), end=len('Some text here'),
        href='http://example.com/bbb'
    )
    cursor = DocCursor.load_from_model(node)
    content = doc_cursor.DocCursorSerializer(cursor).data['content']

    assert len(content) == 3
    assert [c['text'] for c in content] == ['Some ', 'text', ' here']
    assert [c['content_type'] for c in content] == [
        'external_link', '__text__', 'external_link',
    ]


def test_children_field_to_internal_value_works():
    para = f.para([])
    assert doc_cursor.ChildrenField().to_internal_value([para]) == [para]


def test_footnote_type_emblem_existence_is_validated():
    footnote = f.footnote(1, [])

    doc_cursor.DocCursorSerializer(data=footnote)\
        .is_valid(raise_exception=True)

    del footnote['type_emblem']

    s = doc_cursor.DocCursorSerializer(data=footnote)
    assert not s.is_valid()
    assert s.errors == {
        'type_emblem': ["'footnote' nodes must have type emblems."]
    }


def test_footnote_type_emblem_uniqueness_is_validated():
    doc_cursor.DocCursorSerializer(data=f.para([], children=[
        f.footnote(1, []),
        f.footnote(2, [])
    ])).is_valid(raise_exception=True)

    s = doc_cursor.DocCursorSerializer(data=f.para([], children=[
        f.para([], children=[f.footnote(1, [])]),
        f.para([], children=[f.footnote(1, [])]),
    ]))
    assert not s.is_valid()
    assert s.errors == {
        'non_field_errors': ["Multiple footnotes exist with type emblem '1'"]
    }


def test_footnote_citations_are_validated():
    doc_cursor.DocCursorSerializer(data=f.para([
        f.footnote_citation([f.text('1')]),
    ], children=[
        f.footnote(1, []),
    ])).is_valid(raise_exception=True)

    s = doc_cursor.DocCursorSerializer(data=f.para([
        f.footnote_citation([f.text('2')]),
    ], children=[
        f.footnote(1, []),
    ]))
    assert not s.is_valid()
    assert s.errors == {
        'non_field_errors': ["Citation for '2' has no matching footnote"]
    }


def test_children_field_type_emblem_uniqueness_is_validated():
    para = f.para([])

    doc_cursor.ChildrenField().to_internal_value([
        {'type_emblem': 'a', **para},
        {'type_emblem': 'b', **para},
    ])

    err_msg = ("Multiple occurrences of 'para' with emblem 'a' "
               "exist as siblings")
    with pytest.raises(ValidationError, match=err_msg):
        doc_cursor.ChildrenField().to_internal_value([
            {'type_emblem': 'a', **para},
            {'type_emblem': 'a', **para},
        ])


def test_content_field_to_internal_value_works():
    text = f.text('boop')
    assert doc_cursor.ContentField().to_internal_value([text]) == [{
        'inlines': [],
        **text,
    }]


def test_invalid_type_emblem_raises_validation_error():
    serializer = doc_cursor.DocCursorSerializer(data={'type_emblem': '?#@$'})
    assert not serializer.is_valid()
    assert serializer.errors['type_emblem'] == [
        'Only alphanumeric characters are allowed.'
    ]


@pytest.mark.django_db
def test_create_works():
    policy = mommy.make(Policy)
    serializer = doc_cursor.DocCursorSerializer(
        data=f.para([f.text('hi')]),
        context={'policy': policy},
    )
    serializer.is_valid(raise_exception=True)
    cursor = serializer.save()

    assert cursor.node_type == 'para'
    assert cursor.text == 'hi'
