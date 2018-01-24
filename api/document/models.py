import itertools
from typing import Iterator, List

from django.core.validators import RegexValidator
from django.db import models


class DocNodeQuerySet(models.QuerySet):
    def prefetch_annotations(self):
        '''
        To avoid the "n+1" query problem, we will optimize our querysets by
        either joining 1-to-1 relations (via select_related) or ensuring a
        single query for many-to-many relations (via prefetch_related).
        '''

        footnote_prefetch = models.Prefetch(
            'footnotecitations',
            queryset=FootnoteCitation.objects.select_related('footnote_node'),
        )
        requirement_prefetch = models.Prefetch(
            'inlinerequirements',
            queryset=InlineRequirement.objects.select_related('requirement'),
        )
        return self.\
            prefetch_related(footnote_prefetch, 'cites', 'externallinks',
                             requirement_prefetch)


# Django's `PositiveIntegerField` is named in a very misleading way,
# because it actually allows values of 0. For developers who aren't
# aware of this oddity, we'll alias it to something more accurate.
NonNegativeIntegerField = models.PositiveIntegerField


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
    # e.g. part_447__subpart_A__sec_1__para_b.
    identifier = models.CharField(max_length=1024)
    # e.g. para
    node_type = models.CharField(max_length=64)
    # e.g. b
    type_emblem = models.CharField(
        max_length=16,
        validators=[RegexValidator(
            r'[A-Za-z0-9]+',
            message="Only alphanumeric characters are allowed."
        )]
    )
    text = models.TextField(blank=True)
    # e.g. "(a)", "From:", "1.", "•"
    marker = models.CharField(max_length=64, blank=True)
    # Plain text title for this node (for use in tables of contents, etc.)
    title = models.CharField(max_length=128, blank=True, db_index=True)

    # These fields are used for storing the document heirarchy in a flat
    # relational database as per the nested set model:
    #
    # https://en.wikipedia.org/wiki/Nested_set_model
    left = NonNegativeIntegerField()
    right = NonNegativeIntegerField()
    depth = NonNegativeIntegerField()

    objects = DocNodeQuerySet.as_manager()

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
    start = NonNegativeIntegerField()  # inclusive; within doc_node.text
    end = NonNegativeIntegerField()    # exclusive; within doc_node.text

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
