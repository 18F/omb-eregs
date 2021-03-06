from contextlib import contextmanager
from typing import Any, Iterator, List, Set, Type, TypeVar  # noqa

from rest_framework.exceptions import ValidationError

from document.tree import PrimitiveDict

T = TypeVar('T')


def iter_non_unique(items: List[T]) -> Iterator[T]:
    seen: Set[T] = set()
    for item in items:
        if item in seen:
            yield item
        seen.add(item)


def get_content_length(content: List[PrimitiveDict]) -> int:
    length = 0
    for c in content:
        if c['content_type'] == '__text__':
            length += len(c['text'])
        else:
            length += get_content_length(c['inlines'])
    return length


def get_content_text(content: List[PrimitiveDict]):
    chunks = []
    for c in content:
        if c['content_type'] == '__text__':
            chunks.append(c['text'])
        else:
            chunks.append(get_content_text(c['inlines']))
    return ''.join(chunks)


def iter_children(children: List[PrimitiveDict]) -> Iterator[PrimitiveDict]:
    for child in children:
        yield child
        yield from iter_children(child['children'])


def iter_inlines(inlines: List[PrimitiveDict]) -> Iterator[PrimitiveDict]:
    for inline in inlines:
        yield inline
        yield from iter_inlines(inline['inlines'])


def has_sourceline(data: Any) -> bool:
    return isinstance(data, dict) and '_sourceline' in data


@contextmanager
def add_sourceline_to_errors(data: Any):
    '''
    A context manager for DRF Serializers that adds metadata about the
    source line number that validation errors originated
    from, if possible.

    In order for this to work, the data passed to the
    context manager must have source line number metadata.
    '''

    try:
        yield
    except ValidationError as e:
        if (isinstance(e.detail, dict) and not has_sourceline(e.detail)
                and has_sourceline(data)):
            e.detail['_sourceline'] = data['_sourceline']
        raise e
