from document.models import ExternalLink, FootnoteCitation
from ombpdf.import_json_doc import convert_node, derive_annotations


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


def test_derive_annotations_works_with_footnote_citation():
    para = convert_node({
        "node_type": 'para',
        "content": [{
            "content_type": 'footnote_citation',
            "text": '3',
        }],
        "children": [{
            "node_type": "footnote",
            "marker": '3',
            "type_emblem": '3',
            "content": [{
                "content_type": '__text__',
                "text": 'Hi I am a footnote',
            }],
        }],
    })
    annos = derive_annotations(para)

    assert len(annos) == 1
    assert len(annos[FootnoteCitation]) == 1
    cit = annos[FootnoteCitation][0]
    assert cit.start == 0
    assert cit.end == 1
    assert cit.footnote_node.text == 'Hi I am a footnote'
