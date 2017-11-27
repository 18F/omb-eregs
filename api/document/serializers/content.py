from collections import defaultdict
from typing import Iterator, List

from collections_extended import RangeMap
from rest_framework import serializers

from document.models import (Annotation, ExternalLink, FootnoteCitation,
                             PlainText)
from document.tree import DocCursor


def wrap_all_text(annotations: Iterator[Annotation], text_length: int):
    """Ensure that all text is in an annotation by wrapping it in
    PlainText."""
    flattened = RangeMap()
    for anote in annotations:
        flattened[anote.start:anote.end] = anote    # flattens overlaps
    ranges = list(flattened.ranges())     # make a copy
    previous_end = 0
    for next_start, next_end, _ in ranges:
        if next_start != previous_end:
            flattened[previous_end:next_start] = PlainText(
                start=previous_end, end=next_start)
        previous_end = next_end

    # Account for trailing text
    if previous_end != text_length:
        flattened[previous_end:text_length] = PlainText(
            start=previous_end, end=text_length)

    return flattened.values()


class ContentListSerializer(serializers.BaseSerializer):
    """Figures out which AnnotationSerializer to use when serializing
    content."""
    serializer_mapping = defaultdict(
        lambda: BaseAnnotationSerializer,   # will raise an exception when used
    )

    @property
    def total_text_length(self):
        return len(self.context['cursor'].model.text)

    def to_representation(self, data: List[Annotation]):
        """In addition to the materialized annotations, we need to wrap the
        remaining text in the virtual PlainText annotation."""
        serialized_content = []
        data = wrap_all_text(data, self.total_text_length)
        for anote in data:
            serializer = self.serializer_mapping[type(anote)]
            serialized = serializer(anote, context=self.context).data
            serialized_content.append(serialized)
        return serialized_content


class BaseAnnotationSerializer(serializers.Serializer):
    text = serializers.SerializerMethodField()
    content_type = serializers.SerializerMethodField()

    @property
    def CONTENT_TYPE(self):     # noqa; this is a constant
        raise NotImplementedError('Unknown annotation type')

    @property
    def doc_node_text(self):
        return self.context['cursor'].model.text

    @property
    def cursor_tree(self):
        return self.context['cursor'].tree

    def get_content_type(self, instance: Annotation):
        return self.CONTENT_TYPE

    def get_text(self, instance: Annotation):
        return self.doc_node_text[instance.start:instance.end]


class PlainTextSerializer(BaseAnnotationSerializer):
    CONTENT_TYPE = '__text__'


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


ContentListSerializer.serializer_mapping.update({
    PlainText: PlainTextSerializer,
    FootnoteCitation: FootnoteCitationSerializer,
    ExternalLink: ExternalLinkSerializer,
})
