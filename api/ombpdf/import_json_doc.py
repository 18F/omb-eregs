from typing import Any, Dict, List, NamedTuple, Optional, Type

from django.db import transaction

from document.models import Annotation, DocNode
from document.tree import DocCursor
from reqs.models import Policy

JsonDict = Dict[str, Any]


class JSONAwareCursor(DocCursor):
    """Extension of DocCursor which also tracks the JSON which created each
    node."""
    @property
    def json_content(self) -> List[JsonDict]:
        return self.tree.node[self.identifier].get('json_content')

    @json_content.setter
    def json_content(self, value: List[JsonDict]):
        self.tree.node[self.identifier]['json_content'] = value


class CleanedNode(NamedTuple):
    node: JsonDict
    content: List[JsonDict]
    children: List[JsonDict]

    @classmethod
    def from_json(cls, node):
        cleaned = {}
        for key in NODE_KEYS:
            if key in node:
                cleaned[key] = node[key]
        content = node.get('content', [])
        cleaned['text'] = get_content_text(content)
        return cls(
            node=cleaned,
            content=content,
            children=node.get('children', []),
        )


NODE_KEYS = [
    # TODO: Include 'identifier' here?
    'node_type',
    'type_emblem',
    'marker',
    'title',
]


AnnotationDict = Dict[Type[Annotation], List[Annotation]]


def derive_annotations(root: JSONAwareCursor) -> AnnotationDict:
    # TODO: Implement this.
    raise NotImplementedError()


def get_content_text(content: List[JsonDict]):
    return ''.join([c['text'] for c in content])


def convert_node(node: JsonDict, policy: Optional[Policy]=None,
                 parent: Optional[JSONAwareCursor]=None) -> JSONAwareCursor:
    cleaned = CleanedNode.from_json(node)
    if parent is None:
        cursor = JSONAwareCursor.new_tree(**cleaned.node, policy=policy)
    else:
        cursor = parent.add_child(**cleaned.node)

    for child in cleaned.children:
        convert_node(child, parent=cursor)

    cursor.json_content = cleaned.content

    return cursor


@transaction.atomic
def import_document(doc: JsonDict, omb_policy_id: str):
    policy = Policy.objects.filter(omb_policy_id=omb_policy_id).first()
    DocNode.objects.filter(policy=policy).delete()

    root = convert_node(doc, policy=policy)
    root.nested_set_renumber()

    annotations_by_cls = derive_annotations(root)
    for cls, annotations in annotations_by_cls.items():
        cls.objects.bulk_create(annotations)

    raise Exception('Remove this when we really want to commit')
