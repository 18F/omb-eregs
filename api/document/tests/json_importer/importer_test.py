from typing import List

from document.json_importer.importer import PrimitiveDict, convert_node


def text(value: str):
    return {
        "content_type": "__text__",
        "text": value
    }


def external_link(href: str, inlines: List[PrimitiveDict]):
    return {
        "content_type": "external_link",
        "href": href,
        "inlines": inlines,
    }


PARA_WITH_LINK = {
    "node_type": 'para',
    "children": [],
    "content": [
        text('Hello '),
        external_link('http://example.org/', [text('there')])
    ],
}


def test_convert_paragraph_works():
    para = convert_node(PARA_WITH_LINK)

    assert para.node_type == 'para'
    assert para.text == 'Hello there'
    assert para.json_content == PARA_WITH_LINK['content']
