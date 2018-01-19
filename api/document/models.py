import itertools
from typing import Iterator, List

from django.db import models


class DocNode(models.Model):
    '''
    Represents a node in a document.

    A node has a node type, e.g. 'par' (for a paragraph) or
    'sec' (for a section).

    It also has plain text content, which may be annotated--via a subclass
    of the Annotation model--with semantic details such as external
    links or footnote citations.

    It also can have a single parent, and any number of children.
    '''

    policy = models.ForeignKey('reqs.Policy', on_delete=models.CASCADE)
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

    # These fields are used for storing the document heirarchy in a flat
    # relational database as per the nested set model:
    #
    # https://en.wikipedia.org/wiki/Nested_set_model
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


class Annotation(models.Model):
    '''
    Represents an annotation of some range of text in a DocNode, such as
    a footnote citation or an external link.
    '''

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
        'reqs.Requirement', on_delete=models.CASCADE, related_name='+')
