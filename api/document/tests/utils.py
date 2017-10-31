import random
from string import ascii_lowercase

from document.models import DocNode
from document.tree import DocCursor


def node_type(length: int = None) -> str:
    """Generates a reasonable random string."""
    length = length or random.randint(3, 20)
    return ''.join(random.choice(ascii_lowercase) for _ in range(length))


def random_doc(num_nodes: int = 10, save: bool = False, cls=DocCursor,
               **kwargs) -> DocCursor:
    """Generates a random document with the requested number of nodes. This
    makes no guarantees about the shape of the resulting tree."""
    root = cls.new_tree(node_type(), '0', **kwargs)
    node_count = num_nodes - 1  # subtract one for the root
    to_process = [root]
    while to_process:
        parent = to_process.pop(random.randint(0, len(to_process) - 1))
        for _ in range(random.randint(0, node_count)):
            to_process.append(parent.add_child(node_type(), **kwargs))
            node_count -= 1
        if node_count and not to_process:
            # Still need to add more nodes, start from the top again
            to_process = [root]

    root.nested_set_renumber()
    if save:
        DocNode.objects.bulk_create(n.model for n in root.walk())
    return root
