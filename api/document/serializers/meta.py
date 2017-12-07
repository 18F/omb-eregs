from typing import NamedTuple

from rest_framework import serializers

from document.models import DocNode
from document.tree import DocCursor
from reqs.models import Policy


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = (
            'issuance',
            'omb_policy_id',
            'original_url',
            'title',
        )


class TableOfContentsSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = DocNode
        fields = ('children', 'identifier', 'title')

    def get_children(self, instance):
        return type(self)(instance.children(), many=True).data


class Meta(NamedTuple):
    """Package of all of the data needed to generate the "meta" field."""
    cursor: DocCursor
    is_root: bool
    policy: Policy

    @property
    def node_type(self):
        return self.cursor.node_type


class MetaSerializer(serializers.Serializer):
    descendant_footnotes = serializers.SerializerMethodField()
    policy = serializers.SerializerMethodField()
    table_of_contents = serializers.SerializerMethodField()

    def serialize_doc_cursor(self, doc_cursor: DocCursor):
        serializer = type(self.context['parent_serializer'])
        return serializer(doc_cursor, context={'is_root': False}).data

    def to_representation(self, instance):
        """Remove fields that don't have data."""
        result = super().to_representation(instance)
        to_delete = {key for key, value in result.items() if value is None}
        for key in to_delete:
            del result[key]
        return result

    def get_descendant_footnotes(self, instance):
        """Find all footnote nodes that are cited by this node or any of its
        descendants."""
        if not instance.is_root and instance.node_type != 'table':
            return None
        footnotes = []
        for node in instance.cursor.walk():
            for citation in node.footnotecitations.all():
                subtree = DocCursor(instance.cursor.tree,
                                    citation.footnote_node.identifier)
                footnotes.append(self.serialize_doc_cursor(subtree))
        return footnotes

    def get_policy(self, instance):
        if instance.is_root:
            return PolicySerializer(instance.policy).data

    def get_table_of_contents(self, instance):
        if instance.is_root:
            only_titled = DocNode.objects.exclude(title='')
            titled_cursor = DocCursor.load_from_model(
                instance.cursor.model, queryset=only_titled)
            return TableOfContentsSerializer(titled_cursor).data
