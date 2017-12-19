from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveAPIView
from rest_framework.renderers import BrowsableAPIRenderer, JSONRenderer

from document.models import DocNode, FootnoteCitation, InlineRequirement
from document.renderers import AkomaNtosoRenderer
from document.serializers.doc_cursor import DocCursorSerializer
from document.tree import DocCursor
from reqs.views.policies import policy_or_404


def optimize(queryset):
    """To avoid the "n+1" query problem, we will optimize our querysets by
    either joining 1-to-1 relations (via select_related) or ensuring a single
    query for many-to-many relations (via prefetch_related)."""
    footnote_prefetch = Prefetch(
        'footnotecitations',
        queryset=FootnoteCitation.objects.select_related('footnote_node'),
    )
    requirement_prefetch = Prefetch(
        'inlinerequirements',
        queryset=InlineRequirement.objects.select_related('requirement'),
    )
    return queryset.\
        prefetch_related(footnote_prefetch, 'cites', 'externallinks',
                         requirement_prefetch)


class TreeView(RetrieveAPIView):
    serializer_class = DocCursorSerializer
    renderer_classes = (JSONRenderer, BrowsableAPIRenderer,
                        AkomaNtosoRenderer)
    queryset = DocNode.objects.none()   # Used to determine permissions

    def get_object(self):
        policy = policy_or_404(self.kwargs['policy_id'])
        # we'll pass this policy down when we serialize
        self.policy = policy
        query_args = {'policy_id': policy.pk}
        if self.kwargs.get('identifier'):
            query_args['identifier'] = self.kwargs['identifier']
        else:
            query_args['depth'] = 0
        root_doc = get_object_or_404(optimize(DocNode.objects), **query_args)
        root = DocCursor.load_from_model(root_doc, subtree=False)
        root.add_models(optimize(root_doc.descendants()))
        return root

    def get_serializer_context(self):
        return {
            'policy': getattr(self, 'policy', None),
        }
