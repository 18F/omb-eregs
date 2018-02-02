from io import BytesIO
from typing import List

import pytest
from lxml import etree
from rest_framework.exceptions import ParseError

from document import parsers
from document.tree import PrimitiveDict

from . import factories as f


# https://en.wikipedia.org/wiki/Billion_laughs
BILLION_LAUGHS_XML = """\
<?xml version="1.0"?>
<!DOCTYPE lolz [
 <!ENTITY lol "lol">
 <!ELEMENT lolz (#PCDATA)>
 <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
 <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
 <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
 <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
 <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
 <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
 <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
 <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
 <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<lolz>&lol9;</lolz>"""


def convert_xml_node(text: str) -> PrimitiveDict:
    return parsers.convert_node(etree.fromstring(text), sourcelines=False)


def convert_content_node(text) -> List[PrimitiveDict]:
    return convert_xml_node(f'<a><content>{text}</content></a>')['content']


def parse(xml: str) -> PrimitiveDict:
    parser = parsers.AkomaNtosoParser()
    stream = BytesIO(xml.encode('utf-8'))
    return parser.parse(stream)


def test_parser_works():
    assert parse('<policy></policy>') == {
        "node_type": "policy",
        "content": [],
        "children": [],
        "_sourceline": 1,
    }


def test_parser_raises_parse_error_on_bad_syntax():
    with pytest.raises(ParseError, match="XML syntax error"):
        parse('<a>')


def test_parser_is_resilient_to_billion_laughs():
    with pytest.raises(ParseError,
                       match="Detected an entity reference loop"):
        parse(BILLION_LAUGHS_XML)


def test_num_is_converted():
    assert 'marker' not in convert_xml_node('<b/>')
    assert convert_xml_node('<b><num>3</num></b>')['marker'] == '3'


def test_num_is_not_present_as_child():
    assert convert_xml_node('<b><num>3</num></b>')['children'] == []


def test_error_raised_on_multiple_num_elements():
    with pytest.raises(ParseError,
                       match="<a> contains multiple <num> elements"):
        convert_xml_node('<a><num/><num/></a>')


def test_node_attribs_are_converted():
    assert 'title' not in convert_xml_node('<blah/>')
    assert convert_xml_node('<blah title="foo"/>')['title'] == 'foo'


def test_content_attribs_are_converted():
    assert 'title' not in convert_content_node('<b/>')[0]
    assert convert_content_node('<b title="foo"/>')[0]['title'] == 'foo'


def test_xml_attribs_do_not_overwrite_node_data_keys():
    assert convert_xml_node('<a node_type="b"/>')['node_type'] == 'a'


def test_xml_attribs_do_not_overwrite_content_data_keys():
    assert convert_content_node(
        '<b content_type="c"/>'
    )[0]['content_type'] == 'b'


def test_content_always_exists():
    assert convert_xml_node('<blah/>')['content'] == []
    assert convert_xml_node('<blah><content/></blah>')['content'] == []


def test_content_is_not_present_as_child():
    assert convert_xml_node('<b><content>u</content></b>')['children'] == []


def test_bare_content_text_is_converted():
    assert convert_xml_node('<a><content>hi</content></a>')['content'] == [
        f.text('hi')
    ]


def test_nested_content_text_is_converted():
    assert convert_content_node(
        'hi <a>there <b>buddy</b> ole</a> pal'
    ) == [
        f.text('hi '),
        {
            'content_type': 'a',
            'inlines': [
                f.text('there '),
                {
                    'content_type': 'b',
                    'inlines': [f.text('buddy')],
                },
                f.text(' ole'),
            ],
        },
        f.text(' pal'),
    ]


def test_error_raised_on_multiple_content_elements():
    with pytest.raises(ParseError,
                       match="<a> contains multiple <content> elements"):
        convert_xml_node('<a><content/><content/></a>')


def test_children_are_converted():
    assert convert_xml_node('<a><b/><c/></a>')['children'] == [{
        "node_type": "b",
        "content": [],
        "children": [],
    }, {
        "node_type": "c",
        "content": [],
        "children": [],
    }]
