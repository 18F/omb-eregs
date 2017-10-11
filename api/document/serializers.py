from rest_framework import serializers

from document.models import DocNode
from reqs.models import Requirement
from reqs.serializers import TopicSerializer


class RequirementSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(read_only=True, many=True)

    class Meta:
        model = Requirement
        fields = (
            'citation',
            'impacted_entity',
            'policy_section',
            'policy_sub_section',
            'req_deadline',
            'req_id',
            'topics',
            'verb',
        )


class DocCursorSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    requirement = RequirementSerializer(read_only=True)

    class Meta:
        model = DocNode
        fields = ('identifier', 'node_type', 'type_emblem', 'text', 'depth',
                  'children', 'requirement')

    def to_representation(self, instance):
        """We want to serialize the wrapped model, not the cursor. However, we
        need to hang on to that cursor for rendering our children."""
        self.context['cursor'] = instance
        return super().to_representation(instance.model)

    def get_children(self, instance):
        return self.__class__(
            self.context['cursor'].children(), many=True
        ).data
