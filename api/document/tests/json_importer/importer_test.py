from document.json_importer.importer import convert_node

PARA_WITH_LINK = {
    "node_type": 'para',
    "children": [],
    "content": [{
        "content_type": '__text__',
        "text": 'Hello ',
    }, {
        "content_type": 'external_link',
        "text": 'there',
        "href": 'http://example.org/',
    }],
}


def test_convert_paragraph_works():
    para = convert_node(PARA_WITH_LINK)

    assert para.node_type == 'para'
    assert para.text == 'Hello there'
    assert para.json_content == PARA_WITH_LINK['content']
