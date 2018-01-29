from unittest.mock import Mock

import pytest
from model_mommy import mommy
from rest_framework.serializers import ValidationError

from document.models import DocNode, ExternalLink, PlainText
from document.serializers import content
from document.tree import DocCursor
from reqs.models import Requirement


def test_nest_annotations_no_overlapping():
    annotations = [
        mommy.prepare(ExternalLink, start=4, end=8),
        mommy.prepare(ExternalLink, start=10, end=12),
    ]
    result = content.nest_annotations(annotations, 20)
    assert len(result) == 5
    assert [(r.start, r.end) for r in result] == [
        (0, 4), (4, 8), (8, 10), (10, 12), (12, 20),
    ]
    assert [r.annotation_class for r in result] == [
        PlainText, ExternalLink, PlainText, ExternalLink, PlainText,
    ]


def test_nest_annotations_raises_assertion_error():
    with pytest.raises(AssertionError, matches="doesn't fit in the text"):
        content.nest_annotations([
            mommy.prepare(ExternalLink, start=50, end=60),
        ], 30)


def test_nest_annotations_entirely_nested():
    annotations = [
        mommy.prepare(ExternalLink, start=4, end=8),
        mommy.prepare(ExternalLink, start=6, end=7),
        mommy.prepare(ExternalLink, start=2, end=10),
    ]
    result = content.nest_annotations(annotations, 20)
    assert len(result) == 3
    assert [(r.start, r.end) for r in result] == [(0, 2), (2, 10), (10, 20)]
    root = result[1]

    assert len(root.children) == 3
    assert [(c.start, c.end) for c in root.children] == [
        (2, 4), (4, 8), (8, 10)]

    parent = root.children[1]
    assert len(parent.children) == 3
    assert [(c.start, c.end) for c in parent.children] == [
        (4, 6), (6, 7), (7, 8)]


def test_nest_annotations_adjacent():
    """Annotations next to each other are not nested."""
    annotations = [
        mommy.prepare(ExternalLink, start=0, end=10),
        mommy.prepare(ExternalLink, start=10, end=20),
    ]

    result = content.nest_annotations(annotations, 20)
    assert len(result) == 2
    assert [(r.start, r.end) for r in result] == [(0, 10), (10, 20)]
    assert [r.annotation_class for r in result] == [ExternalLink, ExternalLink]


def test_nest_annotations_initial_nesting():
    """These annotations share a start index."""
    annotations = [
        mommy.prepare(ExternalLink, start=0, end=5),
        mommy.prepare(ExternalLink, start=0, end=10),
    ]

    result = content.nest_annotations(annotations, 20)
    assert len(result) == 2
    assert [(r.start, r.end) for r in result] == [(0, 10), (10, 20)]

    root = result[0]
    assert len(root.children) == 2
    assert [(c.start, c.end) for c in root.children] == [(0, 5), (5, 10)]
    assert [c.annotation_class for c in root.children] == [
        ExternalLink, PlainText]


def test_nest_annotations_symmetric_difference():
    """These annotations overlap but aren't contained."""
    annotations = [
        mommy.prepare(ExternalLink, start=0, end=10),
        mommy.prepare(ExternalLink, start=5, end=20),
    ]
    result = content.nest_annotations(annotations, 20)
    assert len(result) == 2
    assert [(r.start, r.end) for r in result] == [(0, 10), (10, 20)]
    assert [r.annotation_class for r in result] == [ExternalLink, PlainText]

    root = result[0]
    assert len(root.children) == 2
    assert [(c.start, c.end) for c in root.children] == [(0, 5), (5, 10)]
    assert [c.annotation_class for c in root.children] == [
        PlainText, ExternalLink]


def test_wrap_unwrapped_nesting():
    """PlainText should be the leaf nodes."""
    root = content.NestableAnnotation(
        mommy.prepare(ExternalLink, start=0, end=20), None)
    parent = content.NestableAnnotation(
        mommy.prepare(ExternalLink, start=5, end=15), root)
    child = content.NestableAnnotation(
        mommy.prepare(ExternalLink, start=8, end=12), parent)
    aunt = content.NestableAnnotation(
        mommy.prepare(ExternalLink, start=18, end=20), root)
    root.wrap_unwrapped()

    assert [(c.start, c.end) for c in root.children] == [
        (0, 5), (5, 15), (15, 18), (18, 20)]
    assert [c.annotation_class for c in root.children] == [
        PlainText, ExternalLink, PlainText, ExternalLink]

    assert [(c.start, c.end) for c in parent.children] == [
        (5, 8), (8, 12), (12, 15)]
    assert [c.annotation_class for c in parent.children] == [
        PlainText, ExternalLink, PlainText]

    assert [(c.start, c.end) for c in child.children] == [(8, 12)]
    assert [c.annotation_class for c in child.children] == [PlainText]

    assert [(c.start, c.end) for c in aunt.children] == [(18, 20)]
    assert [c.annotation_class for c in aunt.children] == [PlainText]


@pytest.mark.django_db
def test_inline_requirement_with_link_integration():
    docnode = mommy.make(DocNode, text='Hm... go here.')
    req = mommy.make(Requirement, req_id='111.222')
    docnode.inlinerequirements.create(
        start=len('Hm... '), end=len('Hm... go here'),
        requirement=req)
    docnode.externallinks.create(
        start=len('Hm... go '), end=len('Hm... go here'),
        href='http://example.com')

    nested = content.nest_annotations(docnode.annotations(), len(docnode.text))
    result = content.NestedAnnotationSerializer(
        nested,
        context={'cursor': DocCursor.load_from_model(docnode, subtree=False)},
        many=True,
    ).data
    assert result == [
        {'content_type': '__text__', 'inlines': [], 'text': 'Hm... '},
        {
            'content_type': 'requirement',
            'text': 'go here',
            'requirement': {'req_id': '111.222'},
            'inlines': [
                {'content_type': '__text__', 'inlines': [], 'text': 'go '},
                {
                    'content_type': 'external_link',
                    'href': 'http://example.com',
                    'text': 'here',
                    'inlines': [{
                        'content_type': '__text__',
                        'inlines': [],
                        'text': 'here',
                    }],
                },
            ],
        },
        {'content_type': '__text__', 'inlines': [], 'text': '.'},
    ]


def test_error_raised_on_invalid_content_type():
    serializer = content.NestedAnnotationSerializer()

    with pytest.raises(ValidationError) as einfo:
        serializer.to_internal_value({'content_type': 'blarg'})
    assert einfo.value.detail == {
        'content_type': "'blarg' is an invalid content type."
    }


def test_error_raised_on_missing_content_type():
    serializer = content.NestedAnnotationSerializer()

    with pytest.raises(ValidationError) as einfo:
        serializer.to_internal_value({'foo': 'bar'})
    assert einfo.value.detail == {'content_type': 'This field is required.'}


def test_text_deserialization_works():
    serializer = content.NestedAnnotationSerializer()

    obj = {'content_type': '__text__', 'text': 'hello', 'inlines': []}
    assert serializer.to_internal_value(obj) == obj


def test_inlines_work_on_non_leaf_nodes():
    node = {
        'content_type': '__text__', 'text': 'blah', 'inlines': [],
    }
    assert content.InlinesField(is_leaf_node=False)\
        .to_internal_value([node]) == [node]


def test_no_error_raised_on_empty_inlines_in_leaf_nodes():
    assert content.InlinesField(is_leaf_node=True).to_internal_value([]) == []


def test_text_required_is_set_properly():
    assert content.TextField(is_leaf_node=True).required
    assert not content.TextField(is_leaf_node=False).required


def test_error_raised_on_inlines_in_leaf_nodes():
    serializer = content.InlinesField(is_leaf_node=True)

    with pytest.raises(ValidationError,
                       match="leaf nodes cannot contain nested content"):
        serializer.to_internal_value(['hi'])


def test_text_deserializes_to_empty_str_on_non_leaf_nodes():
    assert content.TextField(is_leaf_node=False).to_internal_value('u') == ''


def test_to_representation_raises_error_on_unknown_annotation_type():
    with pytest.raises(NotImplementedError,
                       matches="Annotation type 'int' is not registered"):
        content.NestedAnnotationSerializer().to_representation(Mock(
            annotation_class=int
        ))


def test_unimplemented_content_type_or_annotation_class_raises_error():
    class BadSerializer(content.BaseAnnotationSerializer):
        pass

    with pytest.raises(NotImplementedError):
        BadSerializer().CONTENT_TYPE

    with pytest.raises(NotImplementedError):
        BadSerializer().ANNOTATION_CLASS


def test_nestable_annotation_repr_works():
    na = content.NestableAnnotation('my annotation', None)
    assert repr(na) == "NestableAnnotation('my annotation') []"


def test_non_leaf_inlines_field_validation_error_detail_is_list():
    with pytest.raises(ValidationError) as excinfo:
        content.InlinesField(is_leaf_node=False)\
            .to_internal_value([{}])
    assert isinstance(excinfo.value.detail, list)
