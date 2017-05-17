from rest_framework import serializers

from reqs.models import Agency, AgencyGroup, Policy, Requirement, Topic


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ('id', 'name', 'abbr')


class AgencyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencyGroup
        fields = ('id', 'name')


class GroupWithAgenciesSerializer(serializers.ModelSerializer):
    agencies = AgencySerializer(read_only=True, many=True,
                                source='public_agencies')

    class Meta:
        model = AgencyGroup
        fields = ('id', 'name', 'agencies')


class PolicySerializer(serializers.ModelSerializer):
    total_reqs = serializers.IntegerField(read_only=True)
    relevant_reqs = serializers.IntegerField(read_only=True)
    title_with_number = serializers.CharField(read_only=True)
    original_url = serializers.CharField(read_only=True)

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
            'title_with_number',
            'original_url',
        )


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
