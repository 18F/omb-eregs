from typing import List

from rest_framework import serializers

from document.json_importer.importer import import_json_doc
from document.models import DocNode
from document.serializers.content import (NestedAnnotationSerializer,
                                          nest_annotations)
from document.serializers.meta import Meta, MetaSerializer
from document.tree import DocCursor, JSONAwareCursor, PrimitiveDict


class DocCursorField(serializers.Field):
    def get_attribute(self, instance: DocCursor) -> DocCursor:
        return instance


class ChildrenField(DocCursorField):
    def to_representation(self, instance: DocCursor) -> List[PrimitiveDict]:
        return DocCursorSerializer(
            instance.children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def to_internal_value(self,
                          data: List[PrimitiveDict]) -> List[PrimitiveDict]:
        serializer = DocCursorSerializer(
            context={**self.context, 'is_root': False},
        )
        return [serializer.to_internal_value(item) for item in data]


class ContentField(DocCursorField):
    def to_representation(self, instance: DocCursor) -> List[PrimitiveDict]:
        annotations = nest_annotations(
            instance.annotations(), len(instance.text))
        return NestedAnnotationSerializer(
            annotations,
            context={'cursor': instance,
                     'parent_serializer': self.context['parent_serializer']},
            many=True,
        ).data

    def to_internal_value(self,
                          data: List[PrimitiveDict]) -> List[PrimitiveDict]:
        serializer = NestedAnnotationSerializer()
        return [
            serializer.to_internal_value(item) for item in data
        ]


class DocCursorSerializer(serializers.Serializer):
    """
    A Serializer for the DocCursor class.

    Note that we're doing this manually instead of using
    DRF's serializers.ModelSerializer because:

        * DocCursor isn't actually a Django model.  It's *like*
          a model in a lot of ways, but it's not actually a
          model, so we don't want to cause complications with
          DRF down the road.

        * There are enough deviations between the Django model's
          validation and the REST API's validation that we'd
          still have to write a bunch of code to "undo"
          ModelSerializer's defaults.
    """

    # Read/write fields.
    children = ChildrenField()
    content = ContentField()
    marker = serializers.CharField(
        max_length=DocNode._meta.get_field('marker').max_length,
        allow_blank=True,
        required=False,
    )
    node_type = serializers.CharField(
        max_length=DocNode._meta.get_field('node_type').max_length,
    )
    title = serializers.CharField(
        max_length=DocNode._meta.get_field('title').max_length,
        allow_blank=True,
        required=False,
    )

    # Type emblems are required by our DocNode model, but they aren't
    # required by our API; if not supplied, they will be auto-generated.
    type_emblem = serializers.CharField(
        max_length=DocNode._meta.get_field('type_emblem').max_length,
        validators=DocNode._meta.get_field('type_emblem').validators,
        required=False,
    )

    # Read-only fields.
    meta = serializers.SerializerMethodField()
    depth = serializers.IntegerField(read_only=True)
    identifier = serializers.CharField(read_only=True)
    text = serializers.CharField(read_only=True)

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
               validated_data: PrimitiveDict) -> JSONAwareCursor:
        return import_json_doc(instance.policy, validated_data)
