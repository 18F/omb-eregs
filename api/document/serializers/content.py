from functools import singledispatch
from typing import Iterator, Type

from collections_extended import RangeMap

from document.models import (Annotation, ExternalLink, FootnoteCitation,
                             PlainText)
from document.tree import DocCursor


@singledispatch
def serialize_content(content: Annotation, cursor: DocCursor,
                      cursor_serializer: Type['DocCursorSerializer']):
    raise NotImplementedError()


@serialize_content.register(PlainText)
def serialize_plaintext(content: PlainText, cursor: DocCursor,
                        cursor_serializer: Type['DocCursorSerializer']):
    return {
        'content_type': '__text__',
        'text': cursor.model.text[content.start:content.end],
    }


@serialize_content.register(FootnoteCitation)
def serialize_footnote_citation(
        content: FootnoteCitation, cursor: DocCursor,
        cursor_serializer: Type['DocCursorSerializer']):
    footnote_tree = DocCursor(cursor.tree, content.footnote_node.identifier)
    footnote_node = cursor_serializer(footnote_tree,
                                      context={'is_root': False}).data
    return {
        'content_type': 'footnote_citation',
        'footnote_node': footnote_node,
        'text': cursor.model.text[content.start:content.end],
    }


@serialize_content.register(ExternalLink)
def serialize_external_link(content: ExternalLink, cursor: DocCursor,
                            cursor_serializer: Type['DocCursorSerializer']):
    return {
        'content_type': 'external_link',
        'href': content.href,
        'text': cursor.model.text[content.start:content.end],
    }


def wrap_all_text(annotations: Iterator[Annotation], text_length: int):
    """Ensure that all text is in an annotation by wrapping it in
    PlainText."""
    flattened = RangeMap()
    for anote in annotations:
        flattened[anote.start:anote.end] = anote    # flattens overlaps
    ranges = list(flattened.ranges())     # make a copy
    previous_end = 0
    for next_start, next_end, _ in ranges:
        if next_start != previous_end:
            flattened[previous_end:next_start] = PlainText(
                start=previous_end, end=next_start)
        previous_end = next_end

    # Account for trailing text
    if previous_end != text_length:
        flattened[previous_end:text_length] = PlainText(
            start=previous_end, end=text_length)

    return flattened.values()
