from collections import Counter
from typing import Any, Callable, Dict, Iterator, List, Optional, Type, TypeVar

from networkx import DiGraph
from networkx.algorithms.dag import descendants
from networkx.relabel import relabel_nodes

from document.models import DocNode

PrimitiveDict = Dict[str, Any]

T = TypeVar('T', bound='DocCursor')


class DocCursor():
    """
    DocNodes don't keep track of their children/relationships within a
    tree, so we will generally access them indirectly through a wrapping tree
    (a DiGraph). This DocCursor points to a specific node within that tree.

    Note, though, that the DocCursor doesn't actually need to be
    backed by a database at all, and can be constructed independently
    of one. In fact, this a convenient way to create DocNodes before
    committing them to a database.

    For example, here we'll create a document structure:

        >>> root = DocCursor.new_tree('root', title='my cool doc')
        >>> sec1 = root.add_child('sec', '1', text='section 1')
        >>> para = sec1.add_child('para', 'a', text='paragraph a')

    Each of the above variables is a DocCursor pointing to a
    part of the document. We can see where they're pointing:

        >>> print(sec1)
        parent: root_1 title="my cool doc"
        |- sec_1
           'section 1'
           |- para_a

    The underlying DocNode model can be revealed through the `.model`
    property:

        >>> root.model
        <DocNode: DocNode object>

    As a convenience, properties of the underlying model can be accessed
    on the DocCursor too, e.g.:

        >>> root.node_type
        'root'
        >>> root.depth
        0

    Convenience methods are also provided for traversing the document;

        >>> [node.node_type for node in root.walk()]
        ['root', 'sec', 'para']

        >>> [node.node_type for node in para.ancestors()]
        ['sec', 'root']

        >>> root.jump_to('root_1__sec_1').node_type
        'sec'

    Immediate children of a cursor's node can also be retrieved:

        >>> root['sec_1'].node_type
        'sec'
    """

    __slots__ = ('tree', 'identifier')

    def __init__(self, tree: DiGraph, identifier: str) -> None:
        self.tree = tree
        self.identifier = identifier

    def __getattr__(self, attr):
        """Delegate fields/methods to wrapped model."""
        return getattr(self.model, attr)

    @classmethod
    def new_tree(cls: Type[T], node_type: str, type_emblem: str='1',
                 policy=None, **attrs) -> T:
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
    def load_from_model(cls: Type[T], root_node: DocNode, subtree: bool=True,
                        queryset=None) -> T:
        tree = DiGraph()
        tree.add_node(root_node.identifier, model=root_node)
        root = cls(tree, root_node.identifier)
        if subtree:
            root.add_models(root_node.descendants(queryset))
        return root

    @property
    def model(self) -> DocNode:
        return self.tree.node[self.identifier]['model']

    def __getitem__(self: T, child_suffix: str) -> T:
        child_id = f"{self.identifier}__{child_suffix}"
        if child_id not in self.tree:
            raise KeyError(f"No {child_id} element")
        return self.__class__(self.tree, child_id)

    def children(self: T) -> Iterator[T]:
        edges = [(sort_order, idx) for _, idx, sort_order
                 in self.tree.out_edges(self.identifier, data='sort_order')]
        for _, identifier in sorted(edges):
            yield self.__class__(self.tree, identifier=identifier)

    def next_emblem(self, node_type: str) -> str:
        """While we sometimes know a unique identifier within a parent (for
        example, due to having a paragraph marker such as "(ix)"), much of the
        time we'll just number them sequentially. This method gives us the
        next emblem for a given node_type as a child of self."""
        child_type_counts = Counter(c.node_type for c in self.children())
        return str(child_type_counts[node_type] + 1)

    def add_child(self: T, node_type: str, type_emblem: Optional[str] = None,
                  insert_pos: Optional[int] = None, **attrs) -> T:
        if type_emblem is None:
            type_emblem = self.next_emblem(node_type)
        if 'policy' not in attrs:
            attrs = {**attrs, 'policy': self.tree.graph.get('policy')}

        identifier = f"{self.identifier}__{node_type}_{type_emblem}"
        self.tree.add_node(identifier, model=DocNode(
            identifier=identifier, node_type=node_type,
            type_emblem=type_emblem, depth=self.depth + 1,
            **attrs
        ))
        if insert_pos is None:
            insert_pos = self.next_sort_order()
        else:
            # shift children if necessary
            edges = self.tree.out_edges(self.identifier, data='sort_order')
            for _, child_idx, sort_order in edges:
                if sort_order >= insert_pos:
                    self.tree[self.identifier][child_idx]['sort_order'] += 1
        self.tree.add_edge(self.identifier, identifier, sort_order=insert_pos)
        return self.__class__(self.tree, identifier=identifier)

    def subtree_size(self) -> int:
        # Using "descendants" is a bit more efficient than recursion
        return len(descendants(self.tree, self.identifier)) + 1

    def walk(self: T) -> Iterator[T]:
        """An iterator of all the nodes in this tree."""
        yield self
        for child in self.children():
            for cursor in child.walk():
                yield cursor

    @property
    def _parent_desc(self) -> str:
        parent = self.parent()
        if parent is None:
            return "None"
        return f"{parent.identifier}{parent._attr_str}"

    @property
    def _attr_str(self) -> str:
        attr_strs = []
        for attr in ['title', 'marker']:
            val = getattr(self, attr, None)
            if val:
                attr_strs.append(f'{attr}="{val}"')
        return (' ' + ' '.join(attr_strs)) if attr_strs else ''

    @property
    def _short_desc(self) -> str:
        return f"{self.node_type}_{self.type_emblem}{self._attr_str}"

    def _short_text(self, max_len: int=40) -> str:
        text = self.text
        if len(text) > max_len:
            text = text[:max_len] + '...'
        return repr(text)

    def __str__(self) -> str:
        indent = ''
        lines = [
            f"{indent}parent: {self._parent_desc}",
            f"{indent}|- {self._short_desc}",
        ]
        next_indent = indent + '   '
        if self.text:
            lines.append(f'{next_indent}{self._short_text()}')
        for child in self.children():
            lines.append(f'{next_indent}|- {child._short_desc}')
        return '\n'.join(lines)

    def nested_set_renumber(self, left=1, bulk_create=True) -> None:
        """The nested set model tracks parent/child relationships by requiring
        ancestors's left-right range strictly contain any descendant's
        left-right range. To set that up correctly, we need to renumber our
        nodes once the whole tree is built."""
        self.model.left = left
        self.model.right = left + 2 * self.subtree_size() - 1

        for child in self.children():
            child.nested_set_renumber(left + 1, bulk_create=False)
            left = child.right

        if bulk_create:
            self._bulk_create()

    def _bulk_create(self) -> None:
        DocNode.objects.bulk_create(node.model for node in self.walk())

    def next_sort_order(self) -> int:
        return self.tree.out_degree(self.identifier)

    def parent(self: T) -> Optional[T]:
        predecessors = list(self.tree.predecessors(self.identifier))
        if predecessors:
            return type(self)(self.tree, predecessors[0])
        return None

    def left_sibling(self: T) -> Optional[T]:
        siblings = list(self.left_siblings())
        if siblings:
            return siblings[-1]
        return None

    def right_sibling(self: T) -> Optional[T]:
        siblings = list(self.right_siblings())
        if siblings:
            return siblings[0]
        return None

    def ancestors(self: T, filter_fn: Callable[[T], bool]=None) \
            -> Iterator[T]:
        parent = self.parent()
        if parent and (not filter_fn or filter_fn(parent)):
            yield parent
        if parent:
            yield from parent.ancestors(filter_fn)

    def left_siblings(self: T) -> Iterator[T]:
        """What's before this node, sharing the same parent."""
        parent = self.parent()
        if parent:
            for sibling in parent.children():
                if sibling.identifier == self.identifier:
                    break
                yield sibling

    def right_siblings(self: T) -> Iterator[T]:
        """What's after this node, sharing the same parent."""
        parent = self.parent()
        seen_self = False
        if parent:
            for sibling in parent.children():
                if seen_self:
                    yield sibling
                if sibling.identifier == self.identifier:
                    seen_self = True

    def add_models(self: T, models: Iterator[DocNode]) -> T:
        """Convert a (linear) list of DocNodes into a tree-aware version.
        We assume that the models are already sorted."""
        parent = self
        for child in models:
            # not a child of this parent; move cursor up
            while child.left > parent.right:
                parents_parent = parent.parent()
                if parents_parent is None:
                    raise AssertionError(
                        "Couldn't convert DocNodes into a tree. "
                        "Perhaps they weren't sorted or there was data "
                        "corruption?"
                    )
                parent = parents_parent
            self.tree.add_node(child.identifier, model=child)
            self.tree.add_edge(parent.identifier, child.identifier,
                               sort_order=parent.next_sort_order())
            parent = type(self)(self.tree, child.identifier)
        return self

    def filter(self: T, filter_fn: Callable[[DocNode], bool]) -> Iterator[T]:
        """Find a model in the tree that matches our filtering function."""
        for identifier, model in self.tree.nodes(data='model'):
            if filter_fn(model):
                yield type(self)(self.tree, identifier)

    def jump_to(self: T, identifier: str) -> T:
        return type(self)(self.tree, identifier)

    def append_to(self: T, new_parent: T) -> T:
        """Move this node (and its subtree) to be the last child of the
        new_parent. This requires modifying all of the subtree's
        identifiers."""
        prev_parent = self.parent()
        if not prev_parent:
            raise AssertionError("Can't move a node with no parent")
        # remove from previous position
        self.tree.remove_edge(prev_parent.identifier, self.identifier)
        # add to new position
        old_prefix = self.identifier
        self.model.type_emblem = new_parent.next_emblem(self.node_type)
        new_prefix = (
            new_parent.identifier
            + '__' + self.node_type
            + '_' + self.type_emblem
        )
        self.tree.add_edge(new_parent.identifier, self.identifier,
                           sort_order=new_parent.next_sort_order())

        # relabel
        label_mapping = {}
        for node in self.walk():
            old_label = node.identifier
            node.model.identifier = new_prefix + old_label[len(old_prefix):]
            label_mapping[old_label] = node.model.identifier
        relabel_nodes(self.tree, label_mapping, copy=False)

        return self.jump_to(label_mapping[self.identifier])


class XMLAwareCursor(DocCursor):
    """Extension of DocCursor which also tracks the XML which created each
    node."""
    @property
    def xml_node(self):
        return self.tree.node[self.identifier].get('xml_node')

    @xml_node.setter
    def xml_node(self, value):
        self.tree.node[self.identifier]['xml_node'] = value


class JSONAwareCursor(DocCursor):
    """Extension of DocCursor which also tracks the JSON which created each
    node."""
    @property
    def json_content(self) -> List[PrimitiveDict]:
        return self.tree.node[self.identifier].get('json_content')

    @json_content.setter
    def json_content(self, value: List[PrimitiveDict]):
        self.tree.node[self.identifier]['json_content'] = value
