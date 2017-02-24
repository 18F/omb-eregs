from rest_framework import serializers
from taggit_serializer.serializers import (TaggitSerializer,
                                           TagListSerializerField)

from reqs.models import Keyword, Policy, Requirement


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = (
            'policy_number', 'title', 'uri', 'omb_policy_id', 'policy_type',
            'issuance', 'sunset'
        )


class RequirementSerializer(TaggitSerializer, serializers.ModelSerializer):
    policy = PolicySerializer(read_only=True)
    keywords = TagListSerializerField()

    class Meta:
        model = Requirement
        fields = (
            'policy', 'req_id', 'issuing_body', 'policy_section',
            'policy_sub_section', 'req_text', 'verb', 'impacted_entity',
            'req_deadline', 'citation', 'keywords',
        )


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ('name',)
