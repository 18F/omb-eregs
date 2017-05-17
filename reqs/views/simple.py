from dal.autocomplete import Select2QuerySetView
from rest_framework import viewsets

from reqs.filtersets import TopicFilter
from reqs.models import Topic
from reqs.serializers import TopicSerializer


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_fields = TopicFilter.get_fields()


class TopicAdminAutocomplete(Select2QuerySetView):
    """Very similar to the TopicViewSet, except in a format the Select2
    widget expects"""
    model = Topic
