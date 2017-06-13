from django.db.models import Count, IntegerField, OuterRef, Subquery
from rest_framework import viewsets

from reqs.filtersets import (AgencyFilter, AgencyGroupFilter, PolicyFilter,
                             RequirementFilter, TopicFilter)
from reqs.models import Agency, AgencyGroup, Policy, Requirement, Topic
from reqs.serializers import PolicySerializer


def subfilter_params(params, subfield):
    """Return parameters which are part of a subfield, when making nested
    queries"""
    prefix = subfield + '__'
    offset = len(prefix)
    return {key[offset:]: value for key, value in params.items()
            if key.startswith(prefix)}


def make_filter(param, backref, model_class, filter_class):
    """Create a function which filters a Requirements queryset by GET
    parameters. We don't want to use joins as we ultimately just need a
    count"""
    def filter_fn(params, req_queryset):
        params = subfilter_params(params, param)

        if params:
            subquery = model_class.objects.all()
            subquery = filter_class(params, queryset=subquery).qs
            subquery = subquery.values(backref)
            req_queryset = req_queryset.filter(pk__in=subquery)
        return req_queryset
    return filter_fn


filter_by_topic = make_filter('topics', 'topic__content_object', Topic,
                              TopicFilter)
filter_by_agency = make_filter('agencies', 'requirement', Agency, AgencyFilter)
filter_by_agency_group = make_filter('agency_groups', 'requirement',
                                     AgencyGroup, AgencyGroupFilter)
filter_by_all_agency = make_filter('all_agencies', 'all_requirements', Agency,
                                   AgencyFilter)


def relevant_reqs_count(params):
    """Create a subquery of the count of requirements relevant to the provided
    query parameters"""
    subquery = Requirement.objects.filter(policy=OuterRef('pk'))

    params = subfilter_params(params, 'requirements')
    subquery = RequirementFilter(params, queryset=subquery).qs

    subquery = filter_by_topic(params, subquery)
    subquery = filter_by_agency(params, subquery)
    subquery = filter_by_agency_group(params, subquery)
    subquery = filter_by_all_agency(params, subquery)

    subquery = subquery.values('policy').\
        annotate(count=Count('policy')).values('count').\
        order_by()  # clear default order

    return Subquery(subquery, output_field=IntegerField())


class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    filter_fields = PolicyFilter.get_fields()
    search_fields = ('title',)

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.filter(public=True)
        queryset = queryset.annotate(
            total_reqs=relevant_reqs_count({}),
            relevant_reqs=relevant_reqs_count(self.request.GET),
        ).filter(relevant_reqs__gt=0)
        return queryset
