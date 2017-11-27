from rest_framework import serializers

from document.models import DocNode
from document.serializers.content import serialize_content, wrap_all_text
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

    def to_representation(self, instance):
        """We want to serialize the wrapped model, not the cursor. However, we
        need to hang on to that cursor for rendering our children."""
        self.context['cursor'] = instance
        return super().to_representation(instance.model)

    def get_children(self, instance):
        return self.__class__(
            self.context['cursor'].children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def get_content(self, instance):
        """Include all annotations of the text."""
        all_annotations = wrap_all_text(instance.annotations(),
                                        len(instance.text))
        cursor = self.context['cursor']
        return [serialize_content(anote, cursor, type(self))
                for anote in all_annotations]

    def get_meta(self, instance):
        """Include meta data which applies to the whole node."""
        meta = Meta(
            self.context['cursor'],
            self.context.get('is_root', True),
            self.context.get('policy'),
        )
        return MetaSerializer(meta, context={'parent_serializer': self}).data
