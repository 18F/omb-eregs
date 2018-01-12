from typing import Dict, Iterator, List, Optional, Type

from rest_framework import serializers
from rest_framework.serializers import ValidationError

from document.models import (Annotation, Cite, ExternalLink, FootnoteCitation,
                             InlineRequirement, PlainText)
from document.tree import DocCursor, PrimitiveDict
from reqs.models import Requirement


class NestableAnnotation:
    """Wraps an Annotation with references to annotations it contains and its
    parent."""
    def __init__(self, annotation: Annotation,
                 parent: Optional['NestableAnnotation']) -> None:
        self.annotation = annotation
        # NestableAnnotations point up to the parent and down to children
        self.parent = parent
        self.children: List['NestableAnnotation'] = []
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
            if last.parent is None:
                raise AssertionError(
                    f"{type(anote).__name__} {anote.pk} "
                    f"({anote.start} - {anote.end}) doesn't fit in "
                    f"the text (0 - {text_length}). Data corruption?"
                )
            last = last.parent
        # Enforce all annotations to be nested rather than overlapping
        anote.end = min(anote.end, last.end)
        last = NestableAnnotation(anote, last)
    root.wrap_unwrapped()
    return root.children


class NestableAnnotationField(serializers.Field):
    def get_attribute(self,
                      instance: NestableAnnotation) -> NestableAnnotation:
        return instance


class InlinesField(NestableAnnotationField):
    def __init__(self, is_leaf_node: bool) -> None:
        super().__init__()
        self.is_leaf_node = is_leaf_node

    def to_representation(self,
                          instance: NestableAnnotation) -> List[PrimitiveDict]:
        if self.is_leaf_node:
            return []
        return NestedAnnotationSerializer(
            instance.children, context=self.context, many=True).data

    def to_internal_value(self,
                          data: List[PrimitiveDict]) -> List[PrimitiveDict]:
        if not self.is_leaf_node:
            serializer = NestedAnnotationSerializer()
            return [serializer.to_internal_value(d) for d in data]
        elif data:
            raise ValidationError('leaf nodes cannot contain nested content')
        return []


class TextField(NestableAnnotationField):
    def __init__(self, is_leaf_node: bool) -> None:
        super().__init__()
        self.is_leaf_node = is_leaf_node

    @property
    def doc_node_text(self):
        return self.context['cursor'].text

    def to_representation(self, instance: NestableAnnotation) -> str:
        return self.doc_node_text[instance.start:instance.end]

    def to_internal_value(self, data: str) -> str:
        if self.is_leaf_node:
            serializer = serializers.CharField(trim_whitespace=False)
            return serializer.to_internal_value(data)

        # If this isn't a leaf node, we're not going to complain,
        # because we do fill out this value on non-leaf nodes during
        # serialization, and we want clients to be able to modify
        # serialized responses and send them back without having to
        # do too much work.
        #
        # However, that said, we *will* throw away the text value on
        # non-leaf nodes during deserialization, to make sure it's not
        # accidentally used by anything further down the pipeline.
        return ''


class BaseAnnotationSerializer(serializers.Serializer):
    content_type = serializers.SerializerMethodField()
    inlines = InlinesField(is_leaf_node=False)
    text = TextField(is_leaf_node=False)

    @property
    def CONTENT_TYPE(self) -> str:  # noqa
        raise NotImplementedError()

    @property
    def ANNOTATION_CLASS(self) -> Type['Annotation']:  # noqa
        raise NotImplementedError()

    @property
    def cursor_tree(self):
        return self.context['cursor'].tree

    def get_content_type(self, instance: NestableAnnotation):
        return self.CONTENT_TYPE

    def to_internal_value(self, data: PrimitiveDict) -> PrimitiveDict:
        result = super().to_internal_value(data)
        result['content_type'] = self.CONTENT_TYPE
        return result


class NestedAnnotationSerializer(serializers.Serializer):
    """Figures out which AnnotationSerializer to use when serializing
    content."""
    serializer_mapping: Dict[
        Type[Annotation], Type[BaseAnnotationSerializer]] = {}

    content_type_mapping: Dict[
        str, Type[BaseAnnotationSerializer]] = {}

    @classmethod
    def register(cls, klass: Type[BaseAnnotationSerializer]) \
            -> Type[BaseAnnotationSerializer]:
        obj = klass()

        cls.serializer_mapping[obj.ANNOTATION_CLASS] = klass
        cls.content_type_mapping[obj.CONTENT_TYPE] = klass

        return klass

    def to_representation(self, data: NestableAnnotation):
        serializer = self.serializer_mapping.get(data.annotation_class)
        if serializer is None:
            raise NotImplementedError('Unknown annotation type')
        return serializer(data, context=self.context).data

    def to_internal_value(self, data: PrimitiveDict) -> PrimitiveDict:
        content_type = data.get('content_type')
        if content_type is None:
            raise ValidationError("missing content_type")
        if content_type not in self.content_type_mapping:
            raise ValidationError(f"unknown content_type: {content_type}")
        serializer = self.content_type_mapping[content_type]()
        return serializer.to_internal_value(data)


@NestedAnnotationSerializer.register
class PlainTextSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = '__text__'
    ANNOTATION_CLASS = PlainText
    inlines = InlinesField(is_leaf_node=True)
    text = TextField(is_leaf_node=True)


@NestedAnnotationSerializer.register
class FootnoteCitationSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'footnote_citation'
    ANNOTATION_CLASS = FootnoteCitation
    footnote_node = serializers.SerializerMethodField()

    def get_footnote_node(self, instance: FootnoteCitation):
        footnote_tree = DocCursor(self.cursor_tree,
                                  instance.footnote_node.identifier)
        cursor_serializer = type(self.context['parent_serializer'])
        return cursor_serializer(
            footnote_tree, context={'is_root': False}).data


@NestedAnnotationSerializer.register
class ExternalLinkSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'external_link'
    ANNOTATION_CLASS = ExternalLink
    href = serializers.URLField()


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = (
            'req_id',
        )


@NestedAnnotationSerializer.register
class InlineRequirementSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'requirement'
    ANNOTATION_CLASS = InlineRequirement
    requirement = RequirementSerializer()


@NestedAnnotationSerializer.register
class CiteSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = 'cite'
    ANNOTATION_CLASS = Cite
