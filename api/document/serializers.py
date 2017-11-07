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
            'original_url',
            'title',
        )


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
        return [c.serialize_content(instance) for c in instance.content()]

    def get_meta(self, instance):
        """Include meta data which applies to the whole node."""
        meta = {
            'requirement': None,
        }
        if hasattr(instance, 'requirement'):
            meta['requirement'] = RequirementSerializer(
                instance.requirement).data
        if self.context.get('is_root', True):
            meta['policy'] = PolicySerializer(self.context['policy']).data
        return meta
