import django_filters
from dal.autocomplete import Select2QuerySetView
from django.db.models import Count, IntegerField, OuterRef, Subquery
from django.db.models.expressions import RawSQL
from rest_framework import viewsets
from rest_framework.filters import (BaseFilterBackend, DjangoFilterBackend,
                                    OrderingFilter)

from reqs.models import Policy, Requirement, Topic
from reqs.serializers import (PolicySerializer, RequirementSerializer,
                              TopicSerializer)


class PolicyFilter(django_filters.FilterSet):
    class Meta:
        model = Policy
        fields = {
            'id': ('exact', 'in'),
            'policy_number': ('exact', 'gt', 'gte', 'lt', 'lte', 'in',
                              'range'),
            'title': ('exact', 'icontains'),
            'uri': ('exact', 'icontains'),
            'omb_policy_id': ('exact', 'icontains'),
            'policy_type': ('exact', 'in'),
            'issuance': ('exact', 'gt', 'gte', 'lt', 'lte', 'range', 'year',
                         'month', 'day'),
            'sunset': ('exact', 'gt', 'gte', 'lt', 'lte', 'range', 'year',
                       'month', 'day', 'isnull'),
        }


class RequirementFilter(django_filters.FilterSet):
    class Meta:
        model = Requirement
        fields = {
            'req_id': ('exact',),
            'issuing_body': ('exact', 'icontains'),
            'policy_section': ('exact', 'icontains'),
            'policy_sub_section': ('exact', 'icontains'),
            'req_text': ('icontains',),
            'verb': ('icontains',),
            'impacted_entity': ('icontains',),
            'req_deadline': ('icontains',),
            'citation': ('icontains',),
            'policy_id': ('exact', 'in'),
        }


class TopicFilter(django_filters.FilterSet):
    class Meta:
        model = Topic
        fields = {
            'id': ('exact', 'in'),
            'name': ('exact', 'icontains', 'in'),
        }


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_fields = TopicFilter.get_fields()


class TopicAdminAutocomplete(Select2QuerySetView):
    """Very similar to the TopicViewSet, except in a format the Select2
    widget expects"""
    model = Topic


def subfilter_params(params, subfield):
    """Return parameters which are part of a subfield, when making nested
    queries"""
    prefix = subfield + '__'
    offset = len(prefix)
    return {key[offset:]: value for key, value in params.items()
            if key.startswith(prefix)}


def relevant_reqs_count(params):
    """Create a subquery of the count of requirements relevant to the provided
    query parameters"""
    subquery = Requirement.objects.filter(policy=OuterRef('pk'))

    params = subfilter_params(params, 'requirements')
    subquery = RequirementFilter(params, queryset=subquery).qs

    params = subfilter_params(params, 'topics')

    if params:
        subsubquery = Topic.objects.all()
        subsubquery = TopicFilter(params, queryset=subsubquery).qs
        subsubquery = subsubquery.values('topic__content_object')
        subquery = subquery.filter(pk__in=subsubquery)

    subquery = subquery.values('policy').\
        annotate(count=Count('policy')).values('count').\
        order_by()  # clear default order

    return Subquery(subquery, output_field=IntegerField())


class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    filter_fields = PolicyFilter.get_fields()

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.exclude(nonpublic=True)
        queryset = queryset.annotate(
            total_reqs=relevant_reqs_count({}),
            relevant_reqs=relevant_reqs_count(self.request.GET),
        ).filter(relevant_reqs__gt=0)
        return queryset


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


class HiddenPolicyFilter(BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):
        return queryset.exclude(policy__nonpublic=True)


class RequirementViewSet(viewsets.ModelViewSet):
    # Distinct to account for multiple tag matches when filtering
    queryset = Requirement.objects.select_related('policy').\
        prefetch_related('topics').distinct()
    serializer_class = RequirementSerializer
    filter_fields = RequirementFilter.get_fields()
    # Allow filtering by related objects
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
