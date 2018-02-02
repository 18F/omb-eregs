from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser
from rest_framework.renderers import BrowsableAPIRenderer, JSONRenderer
from rest_framework.response import Response

from document.models import DocNode
from document.parsers import AkomaNtosoParser
from document.renderers import AkomaNtosoRenderer, BrowsableAkomaNtosoRenderer
from document.serializers.doc_cursor import DocCursorSerializer
from document.tree import DocCursor
from reqs.views.policies import policy_or_404


class TreeView(GenericAPIView):
    serializer_class = DocCursorSerializer
    renderer_classes = (JSONRenderer, BrowsableAPIRenderer,
                        AkomaNtosoRenderer, BrowsableAkomaNtosoRenderer)
    parser_classes = (JSONParser, AkomaNtosoParser)
    queryset = DocNode.objects.none()   # Used to determine permissions

    def get_object(self, prefetch_related=True):
        only_public = not self.request.user.is_authenticated
        policy = policy_or_404(self.kwargs['policy_id'], only_public)
        # we'll pass this policy down when we serialize
        self.policy = policy
        query_args = {'policy_id': policy.pk}
        if self.kwargs.get('identifier'):
            query_args['identifier'] = self.kwargs['identifier']
        else:
            query_args['depth'] = 0
        queryset = DocNode.objects
        if prefetch_related:
            queryset = queryset.prefetch_annotations()
        root_doc = get_object_or_404(queryset, **query_args)
        root = DocCursor.load_from_model(root_doc, subtree=False)
        if prefetch_related:
            root.add_models(root_doc.descendants().prefetch_annotations())
        self.check_object_permissions(self.request, root)
        return root

    def get_serializer_context(self):
        return {
            'policy': getattr(self, 'policy', None),
        }

    def get(self, request, *args, **kwargs):
        instance = self.get_object(prefetch_related=True)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        if self.kwargs.get('identifier'):
            return Response({
                'detail': 'Identifiers are unsupported on PUT requests.',
            }, status=status.HTTP_400_BAD_REQUEST)

        # We don't care about prefetching related data because we're
        # about to delete all of it anyways.
        instance = self.get_object(prefetch_related=False)

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


def render_editor(request, policy_id, filename, title):
    # Verify that the policy is valid; 404 when not. We don't actually load
    # the document content as they'll be retrieved from the API
    policy_or_404(policy_id, only_public=False)
    return render(request, filename, {
        'document_url': reverse('document', kwargs={'policy_id': policy_id}),
        'title': title,
    })


@login_required
def editor(request, policy_id):
    return render_editor(request, policy_id, 'document/editor.html',
                         'Document Editor')


@login_required
def editor_akn(request, policy_id):
    return render_editor(request, policy_id, 'document/editor_akn.html',
                         'Akoma Ntoso Editor')
