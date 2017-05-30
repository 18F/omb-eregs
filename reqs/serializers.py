from rest_framework import serializers

from reqs.models import Agency, AgencyGroup, Policy, Requirement, Topic


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ('id', 'name', 'abbr', 'name_with_abbr')


class AgencyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencyGroup
        fields = ('id', 'name')


class GroupWithAgenciesSerializer(serializers.ModelSerializer):
    agencies = AgencySerializer(read_only=True, many=True)

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
            'document_source',
            'id',
            'issuance',
            'issuing_body',
            'omb_policy_id',
            'original_url',
            'policy_number',
            'policy_type',
            'relevant_reqs',
            'sunset',
            'title',
            'title_with_number',
            'total_reqs',
            'uri',
        )


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'name')


class RequirementSerializer(serializers.ModelSerializer):
    agencies = AgencySerializer(read_only=True, many=True)
    agency_groups = AgencyGroupSerializer(read_only=True, many=True)
    policy = PolicySerializer(read_only=True)
    topics = TopicSerializer(read_only=True, many=True)

    class Meta:
        model = Requirement
        fields = (
            'agencies',
            'agency_groups',
            'citation',
            'impacted_entity',
            'policy',
            'policy_section',
            'policy_sub_section',
            'req_deadline',
            'req_id',
            'req_text',
            'topics',
            'verb',
        )
