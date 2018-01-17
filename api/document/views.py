from django.contrib.auth.decorators import login_required
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404, render
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.renderers import BrowsableAPIRenderer, JSONRenderer
from rest_framework.response import Response

from document.models import DocNode, FootnoteCitation, InlineRequirement
from document.renderers import AkomaNtosoRenderer, BrowsableAkomaNtosoRenderer
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


class TreeView(GenericAPIView):
    serializer_class = DocCursorSerializer
    renderer_classes = (JSONRenderer, BrowsableAPIRenderer,
                        AkomaNtosoRenderer, BrowsableAkomaNtosoRenderer)
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

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        if self.kwargs.get('identifier'):
            return Response({
                'detail': 'Identifiers are unsupported on PUT requests.',
            }, status=status.HTTP_400_BAD_REQUEST)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


@login_required
def editor(request, policy_id):
    # Verify that the policy is valid; 404 when not. We don't actually load
    # the document content as they'll be retrieved from the API
    policy_or_404(policy_id)
    return render(request, 'document/editor.html')
