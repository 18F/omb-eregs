from typing import Any, Dict, List

from rest_framework import serializers

from document.models import DocNode
from document.serializers.content import (NestedAnnotationSerializer,
                                          nest_annotations)
from document.serializers.meta import Meta, MetaSerializer
from document.tree import DocCursor

JsonDict = Dict[str, Any]


class DocCursorField(serializers.Field):
    def get_attribute(self, instance: DocCursor) -> DocCursor:
        return instance


class ChildrenField(DocCursorField):
    def to_representation(self, instance: DocCursor) -> List[JsonDict]:
        return DocCursorSerializer(
            instance.children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def to_internal_value(self, data: List[JsonDict]) -> DocCursor:
        raise NotImplementedError()


class DocCursorSerializer(serializers.ModelSerializer):
    children = ChildrenField()
    content = serializers.SerializerMethodField()
    meta = serializers.SerializerMethodField()

    class Meta:
        model = DocNode
        fields = (
            'children',
            'content',
            'depth',
            'identifier',
            'marker',
            'meta',
            'node_type',
            'text',
            'title',
            'type_emblem',
        )

    def get_content(self, instance):
        """Include all annotations of the text."""
        annotations = nest_annotations(
            instance.annotations(), len(instance.text))
        return NestedAnnotationSerializer(
            annotations,
            context={'cursor': instance, 'parent_serializer': self},
            many=True,
        ).data

    def get_meta(self, instance):
        """Include meta data which applies to the whole node."""
        meta = Meta(
            instance,
            self.context.get('is_root', True),
            self.context.get('policy'),
        )
        return MetaSerializer(meta, context={'parent_serializer': self}).data
