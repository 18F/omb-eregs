from typing import List, NamedTuple, Optional

from django.db import transaction

from document.models import DocNode
from document.tree import JSONAwareCursor, JsonDict
from reqs.models import Policy

from .annotations import derive_annotations


class PreparedNode(NamedTuple):
    node: JsonDict
    content: List[JsonDict]
    children: List[JsonDict]

    @classmethod
    def from_json(cls, node):
        prepped = {}
        for key in PRIMITIVE_DOC_NODE_FIELDS:
            if key in node:
                prepped[key] = node[key]
        content = node.get('content', [])
        prepped['text'] = get_content_text(content)
        return cls(
            node=prepped,
            content=content,
            children=node.get('children', []),
        )


PRIMITIVE_DOC_NODE_FIELDS = [
    # TODO: Include 'identifier' here?
    'node_type',
    'type_emblem',
    'marker',
    'title',
]


def get_content_text(content: List[JsonDict]):
    return ''.join(c['text'] for c in content)


def convert_node(node: JsonDict, policy: Optional[Policy]=None,
                 parent: Optional[JSONAwareCursor]=None) -> JSONAwareCursor:
    prepped = PreparedNode.from_json(node)
    if parent is None:
        cursor = JSONAwareCursor.new_tree(policy=policy, **prepped.node)
    else:
        cursor = parent.add_child(**prepped.node)

    for child in prepped.children:
        convert_node(child, parent=cursor)

    cursor.json_content = prepped.content

    return cursor


@transaction.atomic
def import_json_doc(policy: Policy, doc: JsonDict) -> JSONAwareCursor:
    DocNode.objects.filter(policy=policy).delete()

    root = convert_node(doc, policy=policy)
    root.nested_set_renumber()

    annotations_by_cls = derive_annotations(root)
    for cls, annotations in annotations_by_cls.items():
        cls.objects.bulk_create(annotations)

    return root
