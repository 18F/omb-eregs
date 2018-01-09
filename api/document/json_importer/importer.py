from collections import defaultdict
from typing import (Callable, DefaultDict, Dict, List, NamedTuple, Optional,
                    Type)

from django.db import transaction

from document.models import Annotation, DocNode, ExternalLink, FootnoteCitation
from document.tree import JSONAwareCursor, JsonDict
from reqs.models import Policy


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

Annotator = Callable[
    [JSONAwareCursor, JsonDict, int],
    Annotation
]

annotators: Dict[str, Annotator] = {}


def annotator(fn: Annotator):
    annotators[fn.__name__] = fn
    return fn


@annotator
def footnote_citation(cursor: JSONAwareCursor, content: JsonDict,
                      start: int) -> FootnoteCitation:
    text = content['text']
    referencing = list(cursor.filter(
        lambda m: m.node_type == 'footnote'
        and m.type_emblem == text.strip()
    ))
    if not referencing:
        raise ValueError(f'unable to find footnote for citation {text}')
    return FootnoteCitation(
        doc_node=cursor.model, start=start, end=start + len(text),
        footnote_node=referencing[0].model,
    )


@annotator
def external_link(cursor: JSONAwareCursor, content: JsonDict,
                  start: int) -> ExternalLink:
    return ExternalLink(
        doc_node=cursor.model, start=start,
        end=start + len(content['text']), href=content['href']
    )


AnnotationDict = DefaultDict[Type[Annotation], List[Annotation]]


def derive_annotations(cursor: JSONAwareCursor) -> AnnotationDict:
    annotations: AnnotationDict = defaultdict(list)
    start = 0
    for content in cursor.json_content:
        content_type = content['content_type']
        if content_type != '__text__':
            if content_type not in annotators:
                raise ValueError(f"no annotator found for {content_type}")
            anno = annotators[content_type](cursor, content, start)
            annotations[anno.__class__].append(anno)
        start += len(content['text'])

    for child_cursor in cursor.children():
        for cls, annos in derive_annotations(child_cursor).items():
            annotations[cls].extend(annos)

    return annotations


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
