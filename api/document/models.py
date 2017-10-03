from collections import Counter
from typing import Optional

from django.db import models
from networkx import DiGraph

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

    @staticmethod
    def new_tree(node_type: str, type_emblem: str, **attrs):
        tree = DiGraph()
        identifier = f"{node_type}_{type_emblem}"
        tree.add_node(identifier, model=DocNode(
            identifier=identifier, node_type=node_type,
            type_emblem=type_emblem, depth=0,
            **attrs
        ))
        return DocCursor(tree, identifier)


class DocCursor():
    """DocNodes don't keep track of their children/relationships within a
    tree, so we will generally access them indirectly through a wrapping tree
    (a DiGraph). This DocCursor points to a specific node within that tree."""
    __slots__ = ('tree', 'identifier')

    def __init__(self, tree: DiGraph, identifier: str):
        self.tree = tree
        self.identifier = identifier

    @property
    def model(self):
        return self.tree.node[self.identifier]['model']

    def __getitem__(self, child_suffix: str):
        child_id = f"{self.identifier}__{child_suffix}"
        if child_id not in self.tree:
            raise KeyError(f"No {child_id} element")
        return self.__class__(self.tree, child_id)

    def children(self):
        edges = [(sort_order, idx) for _, idx, sort_order
                 in self.tree.out_edges(self.identifier, data='sort_order')]
        for _, identifier in sorted(edges):
            yield self.__class__(self.tree, identifier=identifier)

    def next_emblem(self, node_type):
        """While we sometimes know a unique identifier within a parent (for
        example, due to having a paragraph marker such as "(ix)"), much of the
        time we'll just number them sequentially. This method gives us the
        next emblem for a given node_type as a child of self."""
        child_type_counts = Counter(c.model.node_type for c in self.children())
        return str(child_type_counts[node_type] + 1)

    def add_child(self, node_type: str, type_emblem: Optional[str] = None,
                  **attrs):
        if type_emblem is None:
            type_emblem = self.next_emblem(node_type)

        identifier = f"{self.identifier}__{node_type}_{type_emblem}"
        self.tree.add_node(identifier, model=DocNode(
            identifier=identifier, node_type=node_type,
            type_emblem=type_emblem, depth=self.model.depth + 1,
            **attrs
        ))
        sort_order = self.tree.out_degree(self.identifier)
        self.tree.add_edge(self.identifier, identifier, sort_order=sort_order)
        return self.__class__(self.tree, identifier=identifier)
