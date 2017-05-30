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
