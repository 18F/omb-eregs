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
