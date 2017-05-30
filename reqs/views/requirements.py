from django.db.models import Prefetch
from django.db.models.expressions import RawSQL
from rest_framework import viewsets
from rest_framework.filters import DjangoFilterBackend, OrderingFilter

from reqs.filtersets import (AgencyFilter, AgencyGroupFilter, PolicyFilter,
                             RequirementFilter, TopicFilter)
from reqs.models import Agency, Requirement
from reqs.serializers import RequirementSerializer


class PriorityOrderingFilter(OrderingFilter):
    """If no ordering is requested, sort based on the number of topics
    matched"""
    def priority_ordering(self, request, queryset):
        kw_param = request.query_params.get('topics__id__in', '')
        topics = tuple(int(kw) for kw in kw_param.split(',')
                       if kw.isdigit())
        if topics:
            sql = """
                SELECT count(*) FROM (
                    SELECT tag_id FROM reqs_topicconnect
                    WHERE tag_id IN %s
                    AND content_object_id = reqs_requirement.id
                    GROUP BY tag_id
                ) AS subq
            """
            queryset = queryset.annotate(kw_count=RawSQL(sql, (topics,)))
            queryset = queryset.order_by('-kw_count', 'req_id')
        return queryset

    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)

        if ordering:
            return queryset.order_by(*ordering)
        else:
            return self.priority_ordering(request, queryset)


class RequirementViewSet(viewsets.ModelViewSet):
    # Distinct to account for multiple tag matches when filtering
    queryset = Requirement.objects.select_related('policy').\
        prefetch_related(
            Prefetch('agencies', Agency.objects.filter(nonpublic=False)),
            'agency_groups',
            'topics'
        ).distinct()
    serializer_class = RequirementSerializer
    filter_fields = RequirementFilter.get_fields()
    # Allow filtering by related objects
    filter_fields.update({
        'agencies__' + key: value
        for key, value in AgencyFilter.get_fields().items()})
    filter_fields.update({
        'agency_groups__' + key: value
        for key, value in AgencyGroupFilter.get_fields().items()})
    filter_fields.update({
        'policy__' + key: value
        for key, value in PolicyFilter.get_fields().items()})
    filter_fields.update({
        'topics__' + key: value
        for key, value in TopicFilter.get_fields().items()})
    filter_backends = (DjangoFilterBackend, PriorityOrderingFilter)
    ordering_fields = filter_fields.keys()

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.exclude(policy__nonpublic=True)
        return queryset
