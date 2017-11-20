from typing import NamedTuple

from rest_framework import serializers

from document.models import DocNode
from document.serializers.content import serialize_content
from document.tree import DocCursor
from reqs.models import Policy, Requirement
from reqs.serializers import TopicSerializer


class RequirementSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(read_only=True, many=True)

    class Meta:
        model = Requirement
        fields = (
            'citation',
            'id',
            'impacted_entity',
            'policy_section',
            'policy_sub_section',
            'req_deadline',
            'req_id',
            'topics',
            'verb',
        )


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = (
            'issuance',
            'omb_policy_id',
            'original_url',
            'title',
        )


class Meta(NamedTuple):
    """Package of all of the data needed to generate the "meta" field."""
    cursor: DocCursor
    is_root: bool
    policy: Policy

    @property
    def model(self):
        return self.cursor.model

    @property
    def node_type(self):
        return self.model.node_type


class MetaSerializer(serializers.Serializer):
    descendant_footnotes = serializers.SerializerMethodField()
    policy = serializers.SerializerMethodField()
    requirement = serializers.SerializerMethodField()

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
            for citation in node.model.footnotecitations.all():
                subtree = DocCursor(instance.cursor.tree,
                                    citation.footnote_node.identifier)
                footnotes.append(
                    DocCursorSerializer(subtree,
                                        context={'is_root': False}).data
                )
        return footnotes

    def get_policy(self, instance):
        if instance.is_root:
            return PolicySerializer(instance.policy).data

    def get_requirement(self, instance):
        if hasattr(instance.model, 'requirement'):
            return RequirementSerializer(instance.model.requirement).data


class DocCursorSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    meta = serializers.SerializerMethodField()

    class Meta:
        model = DocNode
        fields = (
            'children',
            'content',
            'depth',
            'identifier',
            'marker',
            'meta',
            'node_type',
            'text',
            'type_emblem',
        )

    def to_representation(self, instance):
        """We want to serialize the wrapped model, not the cursor. However, we
        need to hang on to that cursor for rendering our children."""
        self.context['cursor'] = instance
        return super().to_representation(instance.model)

    def get_children(self, instance):
        return self.__class__(
            self.context['cursor'].children(), many=True,
            context={**self.context, 'is_root': False},
        ).data

    def get_content(self, instance):
        """Include all annotations of the text."""
        cursor = self.context['cursor']
        return [serialize_content(c, cursor, type(self))
                for c in instance.content()]

    def get_meta(self, instance):
        """Include meta data which applies to the whole node."""
        meta = Meta(
            self.context['cursor'],
            self.context.get('is_root', True),
            self.context.get('policy'),
        )
        return MetaSerializer(meta).data
