import itertools
from typing import Iterator, List

from django.db import models

from reqs.models import Policy, Requirement


class DocNode(models.Model):
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    # e.g. part_447__subpart_A__sec_1__para_b
    identifier = models.CharField(max_length=1024)
    # e.g. para
    node_type = models.CharField(max_length=64)
    # e.g. b
    type_emblem = models.CharField(max_length=16)
    text = models.TextField(blank=True)
    # e.g. "(a)", "From:", "1.", "•"
    marker = models.CharField(max_length=64, blank=True)
    # Plain text title for this node (for use in tables of contents, etc.)
    title = models.CharField(max_length=128, blank=True, db_index=True)

    left = models.PositiveIntegerField()
    right = models.PositiveIntegerField()
    depth = models.PositiveIntegerField()

    class Meta:
        unique_together = ('policy', 'identifier')
        index_together = (
            unique_together,
        )

    def descendants(self, queryset=None):
        if queryset is None:
            queryset = type(self).objects
        return queryset.filter(
            left__gt=self.left, right__lt=self.right, policy_id=self.policy_id
        ).order_by('left')

    def ancestor_node_types(self) -> List[str]:
        # reverse so we get the closest ancestor first
        ancestry = reversed(self.identifier.split('__'))
        return [ident.rsplit('_')[0] for ident in ancestry]

    def annotations(self) -> Iterator['Annotation']:
        """Query all of our annotation types."""
        return itertools.chain(self.footnotecitations.all(),
                               self.cites.all(),
                               self.externallinks.all(),
                               self.inlinerequirements.all())


def annotate_with_has_docnodes(queryset=None):
    """We frequently want to filter a Policy queryset by whether or not the
    policies have associated DocNodes. This annotates a queryset with that
    data."""
    if queryset is None:
        queryset = Policy.objects.all()

    subquery = DocNode.objects.filter(policy=models.OuterRef('pk'))
    return queryset.annotate(has_docnodes=models.Exists(subquery))


class Annotation(models.Model):
    doc_node = models.ForeignKey(
        DocNode, on_delete=models.CASCADE, related_name='%(class)ss')
    start = models.PositiveIntegerField()    # inclusive; within doc_node.text
    end = models.PositiveIntegerField()      # exclusive; within doc_node.text

    class Meta:
        abstract = True


class PlainText(Annotation):
    class Meta:
        abstract = True


class Cite(Annotation):
    pass


class FootnoteCitation(Annotation):
    footnote_node = models.ForeignKey(
        DocNode, on_delete=models.CASCADE, related_name='+')


class ExternalLink(Annotation):
    href = models.URLField()


class InlineRequirement(Annotation):
    requirement = models.ForeignKey(
        Requirement, on_delete=models.CASCADE, related_name='+')
