from collections import Counter
from typing import Callable, Optional

from networkx import DiGraph
from networkx.algorithms.dag import descendants

from document.models import DocNode


class DocCursor():
    """DocNodes don't keep track of their children/relationships within a
    tree, so we will generally access them indirectly through a wrapping tree
    (a DiGraph). This DocCursor points to a specific node within that tree."""
    __slots__ = ('tree', 'identifier')

    def __init__(self, tree: DiGraph, identifier: str):
        self.tree = tree
        self.identifier = identifier

    @classmethod
    def new_tree(cls, node_type: str, type_emblem: str='1', policy=None,
                 **attrs):
        attrs = {**attrs, 'policy': policy}
        tree = DiGraph(policy=policy)
        identifier = f"{node_type}_{type_emblem}"
        tree.add_node(identifier, model=DocNode(
            identifier=identifier, node_type=node_type,
            type_emblem=type_emblem, depth=0,
            **attrs
        ))
        return cls(tree, identifier)

    @classmethod
    def load_from_model(cls, root_node: DocNode, subtree: bool=True):
        tree = DiGraph()
        tree.add_node(root_node.identifier, model=root_node)
        root = cls(tree, root_node.identifier)
        if subtree:
            root.add_models(root_node.descendants())
        return root

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
        if 'policy' not in attrs:
            attrs = {**attrs, 'policy': self.tree.graph.get('policy')}

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
                               sort_order=parent.next_sort_order())
            parent = self.__class__(self.tree, child.identifier)
        return self

    def filter(self, filter_fn: Callable[[DocNode], bool]):
        """Find a model in the tree that matches our filtering function."""
        for identifier, model in self.tree.nodes(data='model'):
            if filter_fn(model):
                yield self.__class__(self.tree, identifier)


class XMLAwareCursor(DocCursor):
    """Extension of DocCursor which also tracks the XML which created each
    node."""
    @property
    def xml_node(self):
        return self.tree.node[self.identifier].get('xml_node')

    @xml_node.setter
    def xml_node(self, value):
        self.tree.node[self.identifier]['xml_node'] = value
