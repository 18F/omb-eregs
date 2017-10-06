from rest_framework import serializers

from document.models import DocNode


class DocCursorSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = DocNode
        fields = ('identifier', 'node_type', 'type_emblem', 'text', 'depth',
                  'children')

    def to_representation(self, instance):
        """We want to serialize the wrapped model, not the cursor. However, we
        need to hang on to that cursor for rendering our children."""
        self.context['cursor'] = instance
        return super().to_representation(instance.model)

    def get_children(self, instance):
        return self.__class__(
            self.context['cursor'].children(), many=True
        ).data
