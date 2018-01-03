from ombpdf.import_json_doc import convert_node


def test_convert_paragraph_works():
    node = {
        "node_type": 'para',
        "content": [{
            "content_type": '__text__',
            "text": 'Hi I am a paragraph',
        }],
    }
    para = convert_node(node)

    assert para.node_type == 'para'
    assert para.text == 'Hi I am a paragraph'
    assert para.json_content == node['content']
