from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveAPIView

from document.models import DocNode
from document.serializers import DocCursorSerializer
from document.tree import DocCursor
from reqs.views.policies import policy_or_404


def optimize(queryset):
    """To avoid the "n+1" query problem, we will optimize our querysets by
    either joining 1-to-1 relations (via select_related) or ensuring a single
    query for many-to-many relations (via prefetch_related)."""
    return queryset.\
        select_related('requirement').\
        prefetch_related('footnotecitations', 'requirement__topics')


class TreeView(RetrieveAPIView):
    serializer_class = DocCursorSerializer
    queryset = DocNode.objects.none()   # Used to determine permissions

    def get_object(self):
        policy = policy_or_404(self.kwargs['policy_id'])
        query_args = {'policy_id': policy.pk}
        if self.kwargs.get('identifier'):
            query_args['identifier'] = self.kwargs['identifier']
        else:
            query_args['depth'] = 0
        root_doc = get_object_or_404(optimize(DocNode.objects), **query_args)
        root = DocCursor.load_from_model(root_doc, subtree=False)
        root.add_models(optimize(root_doc.descendants()))
        return root
