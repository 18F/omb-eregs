from collections import Counter
from typing import Optional

from django.db import models
from networkx import DiGraph
from networkx.algorithms.dag import descendants

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

    def subtree(self, queryset=None):
        """Load this DocNode and all its children into a tree."""
        if queryset is None:
            queryset = self.__class__.objects
        descendant_models = queryset.filter(
            left__gt=self.left, right__lt=self.right, policy=self.policy
        ).order_by('left')

        tree = DiGraph()
        tree.add_node(self.identifier, model=self)
        root = DocCursor(tree, self.identifier)
        root.add_models(descendant_models)
        return root


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
        self.tree.add_edge(self.identifier, identifier,
                           sort_order=self.next_sort_order())
        return self.__class__(self.tree, identifier=identifier)

    def subtree_size(self):
        # Using "descendants" is a bit more efficient than recursion
        return len(descendants(self.tree, self.identifier)) + 1

    def walk(self):
        """An iterator of all the nodes in this tree."""
        yield self
        for child in self.children():
            for cursor in child.walk():
                yield cursor

    def nested_set_renumber(self, left=1):
        """The nested set model tracks parent/child relationships by requiring
        ancestors's left-right range strictly contain any descendant's
        left-right range. To set that up correctly, we need to renumber our
        nodes once the whole tree is built."""
        self.model.left = left
        self.model.right = left + 2 * self.subtree_size() - 1

        for child in self.children():
            child.nested_set_renumber(left + 1)
            left = child.model.right

    def next_sort_order(self):
        return self.tree.out_degree(self.identifier)

    def parent(self):
        if '__' in self.identifier:
            parent_idx = self.identifier.rsplit('__', 1)[0]
            return self.__class__(self.tree, parent_idx)

    def add_models(self, models):
        """Convert a (linear) list of DocNodes into a tree-aware version.
        We assume that the models are already sorted."""
        parent = self
        for child in models:
            # not a child of this parent; move cursor up
            while child.left > parent.model.right:
                parent = parent.parent()
            self.tree.add_node(child.identifier, model=child)
            self.tree.add_edge(parent.identifier, child.identifier,
                               sort_order=self.next_sort_order())
            parent = self.__class__(self.tree, child.identifier)
        return self
