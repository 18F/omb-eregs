from typing import List

from rest_framework import serializers

from document.json_importer.importer import (PRIMITIVE_DOC_NODE_FIELDS,
                                             import_json_doc)
from document.models import DocNode
from document.serializers.content import (NestedAnnotationSerializer,
                                          nest_annotations)
from document.serializers.meta import Meta, MetaSerializer
from document.tree import DocCursor, JSONAwareCursor, JsonDict


class DocCursorField(serializers.Field):
    def get_attribute(self, instance: DocCursor) -> DocCursor:
        return instance


class ChildrenField(DocCursorField):
    def to_representation(self, instance: DocCursor) -> List[JsonDict]:
        return DocCursorSerializer(
            instance.children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def to_internal_value(self, data: List[JsonDict]) -> List[JsonDict]:
        serializer = DocCursorSerializer(
            context={**self.context, 'is_root': False},
        )
        return [serializer.to_internal_value(item) for item in data]


class ContentField(DocCursorField):
    def to_representation(self, instance: DocCursor) -> List[JsonDict]:
        annotations = nest_annotations(
            instance.annotations(), len(instance.text))
        return NestedAnnotationSerializer(
            annotations,
            context={'cursor': instance,
                     'parent_serializer': self.context['parent_serializer']},
            many=True,
        ).data

    def to_internal_value(self, data: List[JsonDict]) -> List[JsonDict]:
        serializer = NestedAnnotationSerializer()
        return [
            serializer.to_internal_value(item) for item in data
        ]


class DocCursorSerializer(serializers.ModelSerializer):
    children = ChildrenField()
    content = ContentField()
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
        read_only_fields = tuple(
            field for field in fields
            if field not in PRIMITIVE_DOC_NODE_FIELDS + [
                'children',
                'content'
            ]
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.context['parent_serializer'] = self

    def get_meta(self, instance):
        """Include meta data which applies to the whole node."""
        meta = Meta(
            instance,
            self.context.get('is_root', True),
            self.context.get('policy'),
        )
        return MetaSerializer(meta, context={'parent_serializer': self}).data

    def update(self, instance: DocCursor,
               validated_data: JsonDict) -> JSONAwareCursor:
        return import_json_doc(instance.policy, validated_data)
