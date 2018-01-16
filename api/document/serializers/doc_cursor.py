from typing import Any, Dict, List

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


def docnode_field_attrs(field: str, attrs: List[str]) -> Dict[str, Any]:
    """
    Translate Django model field attributes from the DocNode model
    into attributes that Django REST Framework serializers
    understand.

    Note that we're doing this manually instead of using
    serializers.ModelSerializer because:

        * DocCursor isn't actually a Django model.  It's *like*
          a model in a lot of ways, but its just different
          enough that annoying workarounds would be needed
          to make it work with ModelSerializer.

        * There are enough deviations between the Django model's
          validation and the REST API's validation that we'd
          still have to write a bunch of code to "undo"
          ModelSerializer's defaults.
    """

    attr_map = {
        'blank': 'allow_blank',
    }
    metadata = DocNode._meta.get_field(field)
    result = {
        attr_map.get(attr, attr): getattr(metadata, attr)
        for attr in attrs
    }
    if result.get('allow_blank'):
        result['required'] = False
    return result


class DocCursorSerializer(serializers.Serializer):
    # Read/write fields.
    children = ChildrenField()
    content = ContentField()
    marker = serializers.CharField(
        **docnode_field_attrs('marker', ['max_length', 'blank']),
    )
    node_type = serializers.CharField(
        **docnode_field_attrs('node_type', ['max_length']),
    )
    title = serializers.CharField(
        **docnode_field_attrs('title', ['max_length', 'blank']),
    )

    # Type emblems are required by our DocNode model, but they aren't
    # required by our API; if not supplied, they will be auto-generated.
    type_emblem = serializers.CharField(
        **docnode_field_attrs('type_emblem', ['max_length']),
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
