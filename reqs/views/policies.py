from django.db.models import Count, IntegerField, OuterRef, Subquery
from rest_framework import viewsets

from reqs.filtersets import PolicyFilter, RequirementFilter, TopicFilter
from reqs.models import Policy, Requirement, Topic
from reqs.serializers import PolicySerializer


def subfilter_params(params, subfield):
    """Return parameters which are part of a subfield, when making nested
    queries"""
    prefix = subfield + '__'
    offset = len(prefix)
    return {key[offset:]: value for key, value in params.items()
            if key.startswith(prefix)}


def filter_by_topic(params, req_queryset):
    """Given a queryset of Requirements, filter it by a subquery based on
    which topic parameters are present in the url"""
    topic_params = subfilter_params(params, 'topics')

    if topic_params:
        subquery = Topic.objects.all()
        subquery = TopicFilter(topic_params, queryset=subquery).qs
        subquery = subquery.values('topic__content_object')
        req_queryset = req_queryset.filter(pk__in=subquery)
    return req_queryset


def relevant_reqs_count(params):
    """Create a subquery of the count of requirements relevant to the provided
    query parameters"""
    subquery = Requirement.objects.filter(policy=OuterRef('pk'))

    params = subfilter_params(params, 'requirements')
    subquery = RequirementFilter(params, queryset=subquery).qs

    subquery = filter_by_topic(params, subquery)

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
