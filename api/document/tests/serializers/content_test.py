from model_mommy import mommy

from document.models import ExternalLink, PlainText
from document.serializers import content


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
