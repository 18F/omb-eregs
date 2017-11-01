from rest_framework import serializers

from document.models import DocNode
from reqs.models import Policy, Requirement
from reqs.serializers import TopicSerializer


class RequirementSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(read_only=True, many=True)

    class Meta:
        model = Requirement
        fields = (
            'citation',
            'id',
            'impacted_entity',
            'policy_section',
            'policy_sub_section',
            'req_deadline',
            'req_id',
            'topics',
            'verb',
        )


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = (
            'issuance',
            'omb_policy_id',
            'title',
            'uri',
        )


class DocCursorSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    requirement = RequirementSerializer(read_only=True)
    content = serializers.SerializerMethodField()

    class Meta:
        model = DocNode
        fields = ('identifier', 'node_type', 'type_emblem', 'text', 'depth',
                  'children', 'requirement', 'content')

    def to_representation(self, instance):
        """We want to serialize the wrapped model, not the cursor. However, we
        need to hang on to that cursor for rendering our children."""
        self.context['cursor'] = instance
        as_dict = super().to_representation(instance.model)
        if self.context.get('is_root', True):
            as_dict.update(self.root_only_attrs(instance))
        return as_dict

    @staticmethod
    def root_only_attrs(cursor):
        return {
            'policy': PolicySerializer(cursor.model.policy).data
        }

    def get_children(self, instance):
        return self.__class__(
            self.context['cursor'].children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def get_content(self, instance):
        return [c.serialize_content(instance) for c in instance.content()]
