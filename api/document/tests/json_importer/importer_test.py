from document.json_importer.importer import convert_node


def text(value: str):
    return {
        "content_type": "__text__",
        "text": value
    }


PARA_WITH_LINK = {
    "node_type": 'para',
    "children": [],
    "content": [text('Hello '), {
        "content_type": 'external_link',
        "inlines": [text('there')],
        "href": 'http://example.org/',
    }],
}


def test_convert_paragraph_works():
    para = convert_node(PARA_WITH_LINK)

    assert para.node_type == 'para'
    assert para.text == 'Hello there'
    assert para.json_content == PARA_WITH_LINK['content']
