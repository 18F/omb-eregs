from django.db.models.expressions import RawSQL
from rest_framework import viewsets

from reqs.models import Keyword, Policy, Requirement
from reqs.serializers import (KeywordSerializer, PolicySerializer,
                              RequirementSerializer)


class KeywordViewSet(viewsets.ModelViewSet):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    filter_fields = {
        'name': ('exact', 'icontains', 'in')
    }


class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    filter_fields = {
        'policy_number': ('exact', 'gt', 'gte', 'lt', 'lte', 'in', 'range'),
        'title': ('exact', 'icontains'),
        'uri': ('exact', 'icontains'),
        'omb_policy_id': ('exact', 'icontains'),
        'policy_type': ('exact', 'in'),
        'issuance': ('exact', 'gt', 'gte', 'lt', 'lte', 'range', 'year',
                     'month', 'day'),
        'sunset': ('exact', 'gt', 'gte', 'lt', 'lte', 'range', 'year',
                   'month', 'day', 'isnull')
    }


class RequirementViewSet(viewsets.ModelViewSet):
    # Distinct to account for multiple tag matches when filtering
    queryset = Requirement.objects.select_related('policy').prefetch_related(
        'keywords').distinct()
    serializer_class = RequirementSerializer
    filter_fields = {
        'req_id': ('exact',),
        'issuing_body': ('exact', 'icontains'),
        'policy_section': ('exact', 'icontains'),
        'policy_sub_section': ('exact', 'icontains'),
        'req_text': ('icontains',),
        'verb': ('icontains',),
        'impacted_entity': ('icontains',),
        'req_deadline': ('icontains',),
        'citation': ('icontains',),
    }
    # Allow filtering by related objects
    filter_fields.update(
        {'policy__' + key: value
         for key, value in PolicyViewSet.filter_fields.items()})
    filter_fields.update(
        {'keywords__' + key: value
         for key, value in KeywordViewSet.filter_fields.items()})

    def get_queryset(self):
        """Order by number of matching keywords"""
        kw_param = self.request.query_params.get('keywords__name__in', '')
        keywords = tuple(kw.strip() for kw in kw_param.split(','))
        sql = """
            SELECT count(*) FROM reqs_keywordconnect AS con
            INNER JOIN reqs_keyword kw ON (con.tag_id = kw.id)
            WHERE kw.name IN %s
            AND con.content_object_id = reqs_requirement.id
        """
        annotated = self.queryset.annotate(kw_count=RawSQL(sql, (keywords,)))
        ordered = annotated.order_by('-kw_count', 'req_id')
        return ordered
