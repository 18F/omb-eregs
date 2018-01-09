from collections import defaultdict
from typing import Callable, DefaultDict, Dict, List, Type

from document.models import Annotation, ExternalLink, FootnoteCitation
from document.tree import JSONAwareCursor, JsonDict

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
