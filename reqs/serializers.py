from rest_framework import serializers

from reqs.models import Policy, Requirement, Topic


class PolicySerializer(serializers.ModelSerializer):
    total_reqs = serializers.IntegerField(read_only=True)
    relevant_reqs = serializers.IntegerField(read_only=True)

    class Meta:
        model = Policy
        fields = (
            'policy_number',
            'title',
            'uri',
            'omb_policy_id',
            'policy_type',
            'issuance',
            'sunset',
            'id',
            'total_reqs',
            'relevant_reqs',
            'document_source',
        )
        document_source = serializers.FileField(use_url=True)


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'name')


class RequirementSerializer(serializers.ModelSerializer):
    policy = PolicySerializer(read_only=True)
    topics = TopicSerializer(read_only=True, many=True)

    class Meta:
        model = Requirement
        fields = (
            'policy', 'req_id', 'issuing_body', 'policy_section',
            'policy_sub_section', 'req_text', 'verb', 'impacted_entity',
            'req_deadline', 'citation', 'topics',
        )
