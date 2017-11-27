from typing import Iterator, List

from collections_extended import RangeMap
from rest_framework import serializers

from document.models import (Annotation, ExternalLink, FootnoteCitation,
                             PlainText)
from document.tree import DocCursor

content_type_mapping = {
    PlainText: '__text__',
    FootnoteCitation: 'footnote_citation',
    ExternalLink: 'external_link',
}


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


class ContentListSerializer(serializers.ListSerializer):
    @property
    def total_text_length(self):
        return len(self.context['cursor'].model.text)

    def to_representation(self, data: List[Annotation]):
        """In addition to the materialized annotations, we need to wrap the
        remaining text in the virtual PlainText annotation."""
        data = wrap_all_text(data, self.total_text_length)
        return super().to_representation(data)


class ContentSerializer(serializers.Serializer):
    text = serializers.SerializerMethodField()
    content_type = serializers.SerializerMethodField()

    class Meta:
        list_serializer_class = ContentListSerializer

    @property
    def doc_node_text(self):
        return self.context['cursor'].model.text

    @property
    def cursor_tree(self):
        return self.context['cursor'].tree

    def get_text(self, instance: Annotation):
        return self.doc_node_text[instance.start:instance.end]

    def get_content_type(self, instance: Annotation):
        content_type = content_type_mapping.get(type(instance))
        if not content_type:
            raise NotImplementedError(f'Bad annotation: {type(instance)}')
        return content_type

    def to_representation(self, instance: Annotation):
        """Different annotations will have different attributes to display. To
        allow that, we check for a corresponding method name."""
        representation = super().to_representation(instance)
        method_name = f"{representation['content_type']}_attrs"
        if hasattr(self, method_name):
            representation.update(getattr(self, method_name)(instance))
        return representation

    def footnote_citation_attrs(self, instance: FootnoteCitation):
        footnote_tree = DocCursor(self.cursor_tree,
                                  instance.footnote_node.identifier)
        cursor_serializer = type(self.context['parent_serializer'])
        footnote_node = cursor_serializer(footnote_tree,
                                          context={'is_root': False}).data
        return {'footnote_node': footnote_node}

    def external_link_attrs(self, annotation: ExternalLink):
        return {'href': annotation.href}
