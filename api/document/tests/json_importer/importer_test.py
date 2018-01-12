from document.json_importer.importer import convert_node

from .. import factories as f


def test_convert_paragraph_works():
    para_primitive = f.para(content=[
        f.text('Hello '),
        f.external_link('http://example.org/', [f.text('there')])
    ])
    para = convert_node(para_primitive)

    assert para.node_type == 'para'
    assert para.text == 'Hello there'
    assert para.json_content == para_primitive['content']
