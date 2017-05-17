from dal.autocomplete import Select2QuerySetView
from django.db.models import Prefetch
from rest_framework import viewsets

from reqs.filtersets import AgencyFilter, AgencyGroupFilter, TopicFilter
from reqs.models import Agency, AgencyGroup, Topic
from reqs.serializers import (AgencySerializer, GroupWithAgenciesSerializer,
                              TopicSerializer)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_fields = TopicFilter.get_fields()


class TopicAdminAutocomplete(Select2QuerySetView):
    """Very similar to the TopicViewSet, except in a format the Select2
    widget expects"""
    model = Topic


class AgencyViewSet(viewsets.ModelViewSet):
    queryset = Agency.objects.filter(nonpublic=False)
    serializer_class = AgencySerializer
    filter_fields = AgencyFilter.get_fields()


class AgencyGroupViewSet(viewsets.ModelViewSet):
    queryset = AgencyGroup.objects.prefetch_related(
        Prefetch('agencies', AgencyViewSet.queryset))
    serializer_class = GroupWithAgenciesSerializer
    filter_fields = AgencyGroupFilter.get_fields()
    filter_fields.update({
        'agencies__' + key: value
        for key, value in AgencyFilter.get_fields().items()})
