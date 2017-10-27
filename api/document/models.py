from abc import abstractmethod

from collections_extended import RangeMap
from django.db import models

from reqs.models import Policy


class DocNode(models.Model):
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    # e.g. part_447__subpart_A__sect_1__par_b
    identifier = models.CharField(max_length=1024)
    # e.g. par
    node_type = models.CharField(max_length=64)
    # e.g. b
    type_emblem = models.CharField(max_length=16)
    text = models.TextField(blank=True)

    left = models.PositiveIntegerField()
    right = models.PositiveIntegerField()
    depth = models.PositiveIntegerField()

    class Meta:
        unique_together = ('policy', 'identifier')
        index_together = (
            unique_together,
        )

    def descendants(self):
        return self.__class__.objects.filter(
            left__gt=self.left, right__lt=self.right, policy_id=self.policy_id
        ).order_by('left')

    def flattened_annotations(self) -> RangeMap:
        """Fetch all of our annotations and flatten overlaps arbitrarily (for
        now)."""
        annotations = RangeMap()
        for fcite in self.footnotecitations.all():
            annotations[fcite.start:fcite.end] = fcite    # flattens overlaps
        return annotations

    def content(self):
        """Query all of our annotation types to markup the content of this
        DocNode. Ensure all text is wrapped in an annotation by wrapping it in
        the PlainText annotation. We'll flatten our overlaps arbitrarily for
        now."""
        if not self.text:
            return []

        annotations = self.flattened_annotations()
        wrap_all_text(annotations, len(self.text))

        return list(annotations.values())


def wrap_all_text(annotations: RangeMap, text_length: int):
    """Ensure that all text is in an annotation by wrapping it in
    PlainText."""
    ranges = list(annotations.ranges())     # make a copy
    previous_end = 0
    for next_start, next_end, _ in ranges:
        if next_start != previous_end:
            annotations[previous_end:next_start] = PlainText(
                start=previous_end, end=next_start)
        previous_end = next_end

    # Account for trailing text
    if previous_end != text_length:
        annotations[previous_end:text_length] = PlainText(
            start=previous_end, end=text_length)


class Annotation(models.Model):
    doc_node = models.ForeignKey(
        DocNode, on_delete=models.CASCADE, related_name='%(class)ss')
    start = models.PositiveIntegerField()    # inclusive; within doc_node.text
    end = models.PositiveIntegerField()      # exclusive; within doc_node.text

    class Meta:
        abstract = True

    @property
    @abstractmethod
    def content_type(self):
        raise NotImplementedError()

    def serialize_content(self, doc_node=None):
        doc_node = doc_node or self.doc_node
        return {
            'content_type': self.content_type,
            'text': doc_node.text[self.start:self.end],
        }


class PlainText(Annotation):
    content_type = '__text__'

    class Meta:
        abstract = True


class FootnoteCitation(Annotation):
    content_type = 'footnote_citation'
    footnote_node = models.ForeignKey(
        DocNode, on_delete=models.CASCADE, related_name='+')

    def serialize_content(self, doc_node=None):
        result = super().serialize_content(doc_node)
        result['footnote_node'] = self.footnote_node.identifier
        return result
