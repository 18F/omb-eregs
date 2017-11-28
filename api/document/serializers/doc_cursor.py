from rest_framework import serializers

from document.models import DocNode
from document.serializers.content import ContentListSerializer
from document.serializers.meta import Meta, MetaSerializer


class DocCursorSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
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
            'type_emblem',
        )

    @property
    def cursor(self):
        return self.context['cursor']

    def to_representation(self, instance):
        """We want to serialize the wrapped model, not the cursor. However, we
        need to hang on to that cursor for rendering our children."""
        self.context['cursor'] = instance
        return super().to_representation(instance.model)

    def get_children(self, instance):
        return self.__class__(
            self.cursor.children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def get_content(self, instance):
        """Include all annotations of the text."""
        return ContentListSerializer(
            instance.annotations(),
            context={'cursor': self.cursor, 'parent_serializer': self},
        ).data

    def get_meta(self, instance):
        """Include meta data which applies to the whole node."""
        meta = Meta(
            self.cursor,
            self.context.get('is_root', True),
            self.context.get('policy'),
        )
        return MetaSerializer(meta, context={'parent_serializer': self}).data
