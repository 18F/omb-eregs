from typing import Optional

from django.db import transaction

from document.models import DocNode
from document.tree import JSONAwareCursor, JsonDict
from reqs.models import Policy

from .annotations import derive_annotations, get_content_text


def convert_node(node: JsonDict, policy: Optional[Policy]=None,
                 parent: Optional[JSONAwareCursor]=None) -> JSONAwareCursor:
    kwargs = node.copy()
    children = kwargs.pop('children')
    content = kwargs.pop('content')
    kwargs['text'] = get_content_text(content)

    if parent is None:
        cursor = JSONAwareCursor.new_tree(policy=policy, **kwargs)
    else:
        cursor = parent.add_child(**kwargs)

    for child in children:
        convert_node(child, parent=cursor)

    cursor.json_content = content

    return cursor


@transaction.atomic
def import_json_doc(policy: Policy, doc: JsonDict) -> JSONAwareCursor:
    """Imports a document from a JSON blob. It is assumed that the
    blob has been validated and normalized by a Django REST API
    serializer."""
    DocNode.objects.filter(policy=policy).delete()

    root = convert_node(doc, policy=policy)
    root.nested_set_renumber()

    annotations_by_cls = derive_annotations(root)
    for cls, annotations in annotations_by_cls.items():
        cls.objects.bulk_create(annotations)

    return root
