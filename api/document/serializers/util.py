from typing import Iterator, List, Set, Type, TypeVar  # noqa

from rest_framework.serializers import Serializer

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


def list_to_internal_value(data: List[PrimitiveDict],
                           serializer_class: Type[Serializer],
                           *args, **kwargs) -> List[PrimitiveDict]:
    # The only real reason this function exists is because
    # the way DRF's `many=True` changes the type signatures of
    # a serializer's methods is extremely hard/impossible to
    # express as a type annotation. So this is really just a
    # way to "twist mypy's arm" into annotating things the way we
    # want.
    serializer = serializer_class(*args, **{
        'many': True,
        'data': data,
        **kwargs
    })
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data
