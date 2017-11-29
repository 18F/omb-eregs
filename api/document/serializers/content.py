from collections import defaultdict
from typing import Iterator, List, Optional

from rest_framework import serializers

from document.models import (Annotation, ExternalLink, FootnoteCitation,
                             InlineRequirement, PlainText)
from document.tree import DocCursor
from reqs.models import Requirement


class NestableAnnotation:
    """Wraps an Annotation with references to annotations it contains and its
    parent."""
    def __init__(self, annotation: Annotation,
                 parent: Optional['NestedAnnotation']):
        self.annotation = annotation
        # NestableAnnotations point up to the parent and down to children
        self.parent = parent
        self.children: List[NestedAnnotation] = []
        if parent:
            parent.children.append(self)

    @property
    def annotation_class(self):
        return type(self.annotation)

    def __getattr__(self, attr):
        """Delegate fields/methods to annotation."""
        return getattr(self.annotation, attr)

    def __contains__(self, child: Annotation):
        """We are not allowing non-nested overlapping annotation, so we won't
        compare ends when determining nesting."""
        return self.start <= child.start and self.end > child.start

    def __repr__(self):
        return (f'NestableAnnotation({repr(self.annotation)}) '
                f'{repr(self.children)}')

    def wrap_unwrapped(self):
        """Ensure that all text is in an annotation by wrapping it in
        PlainText."""
        updated_children = []

        previous_end = self.start
        for anote in list(self.children):   # copy to ensure we iterate once
            if anote.start != previous_end:
                updated_children.append(NestableAnnotation(
                    PlainText(start=previous_end, end=anote.start), self))
            anote.wrap_unwrapped()
            updated_children.append(anote)
            previous_end = anote.end

        # Account for trailing text
        if previous_end != self.end:
            updated_children.append(NestableAnnotation(
                PlainText(start=previous_end, end=self.end), self))

        self.children = updated_children


def nest_annotations(annotations: Iterator[Annotation],
                     text_length: int) -> List[NestableAnnotation]:
    """Converts overlapping annotations into a nested version."""
    in_order = sorted(annotations, key=lambda a: (a.start, -a.end))
    # Easier to operate on a single root, even if we'll remove it later.
    root = last = NestableAnnotation(PlainText(start=0, end=text_length), None)
    for anote in in_order:
        # We're not allowing non-nested overlapping annotations, so we won't
        # compare ends when determining nesting
        while anote not in last:
            last = last.parent
        # Enforce all annotations to be nested rather than overlapping
        anote.end = min(anote.end, last.end)
        last = NestableAnnotation(anote, last)
    root.wrap_unwrapped()
    return root.children


class NestedAnnotationSerializer(serializers.Serializer):
    """Figures out which AnnotationSerializer to use when serializing
    content."""
    serializer_mapping = defaultdict(
        lambda: BaseAnnotationSerializer,   # will raise an exception when used
    )

    def to_representation(self, data: NestableAnnotation):
        serializer = self.serializer_mapping[data.annotation_class]
        return serializer(data, context=self.context).data


class BaseAnnotationSerializer(serializers.Serializer):
    content_type = serializers.SerializerMethodField()
    inlines = serializers.SerializerMethodField()
    text = serializers.SerializerMethodField()

    @property
    def CONTENT_TYPE(self):     # noqa; this is a constant
        raise NotImplementedError('Unknown annotation type')

    @property
    def doc_node_text(self):
        return self.context['cursor'].model.text

    @property
    def cursor_tree(self):
        return self.context['cursor'].tree

    def get_content_type(self, instance: NestableAnnotation):
        return self.CONTENT_TYPE

    def get_inlines(self, instance: NestableAnnotation):
        return NestedAnnotationSerializer(
            instance.children, context=self.context, many=True).data

    def get_text(self, instance: Annotation):
        return self.doc_node_text[instance.start:instance.end]


class PlainTextSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = '__text__'

    def get_inlines(self, instance: PlainText):
        """PlainText nodes are the leaves of our content tree."""
        return []


class FootnoteCitationSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'footnote_citation'
    footnote_node = serializers.SerializerMethodField()

    def get_footnote_node(self, instance: FootnoteCitation):
        footnote_tree = DocCursor(self.cursor_tree,
                                  instance.footnote_node.identifier)
        cursor_serializer = type(self.context['parent_serializer'])
        return cursor_serializer(
            footnote_tree, context={'is_root': False}).data


class ExternalLinkSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'external_link'
    href = serializers.URLField()


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = (
            'req_id',
        )


class InlineRequirementSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'requirement'
    requirement = RequirementSerializer()


NestedAnnotationSerializer.serializer_mapping.update({
    PlainText: PlainTextSerializer,
    FootnoteCitation: FootnoteCitationSerializer,
    ExternalLink: ExternalLinkSerializer,
    InlineRequirement: InlineRequirementSerializer,
})
