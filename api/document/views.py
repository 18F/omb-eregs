from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveAPIView

from document.models import DocNode
from document.serializers import DocCursorSerializer


class TreeView(RetrieveAPIView):
    serializer_class = DocCursorSerializer
    queryset = DocNode.objects.none()   # Used to determine permissions

    def get_object(self):
        query_args = {'policy_id': self.kwargs['policy_id']}
        if self.kwargs.get('identifier'):
            query_args['identifier'] = self.kwargs['identifier']
        else:
            query_args['depth'] = 0
        root_struct = get_object_or_404(DocNode, **query_args)
        queryset = DocNode.objects.select_related('requirement').\
            prefetch_related('requirement__topics')
        return root_struct.subtree(queryset)
