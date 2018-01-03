from ombpdf.import_json_doc import (ExternalLink, convert_node,
                                    derive_annotations)

PARA_WITH_LINK = {
    "node_type": 'para',
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


def test_derive_annotations_works_with_external_link():
    annos = derive_annotations(convert_node(PARA_WITH_LINK))

    assert len(annos) == 1
    assert len(annos[ExternalLink]) == 1
    link = annos[ExternalLink][0]
    assert link.href == 'http://example.org/'
    assert link.start == len('Hello ')
    assert link.end == link.start + len('there')
