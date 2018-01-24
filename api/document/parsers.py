from typing import List

from lxml import etree
from rest_framework.exceptions import ParseError
from rest_framework.parsers import BaseParser

from document.tree import PrimitiveDict


def text(text_content: str) -> PrimitiveDict:
    return {
        'content_type': '__text__',
        'text': text_content
    }


def convert_content(xml_el: etree.Element) -> List[PrimitiveDict]:
    data = []
    if xml_el.text:
        data.append(text(xml_el.text))
    for child in xml_el:
        data.append({
            **child.attrib,
            'content_type': child.tag,
            'inlines': convert_content(child)
        })
        if child.tail:
            data.append(text(child.tail))
    return data


def ensure_at_most_one_child_has_tag(xml_el: etree.Element, tag: str):
    if len([child for child in xml_el if child.tag == tag]) > 1:
        raise ParseError(f'<{xml_el.tag}> contains multiple '
                         f'<{tag}> elements')


def convert_node(xml_el: etree.Element) -> PrimitiveDict:
    data = {
        'node_type': xml_el.tag,
        'children': [],
        'content': [],
    }
    ensure_at_most_one_child_has_tag(xml_el, 'content')
    ensure_at_most_one_child_has_tag(xml_el, 'num')
    if 'emblem' in xml_el.attrib:
        data['type_emblem'] = xml_el.attrib['emblem']
    for child in xml_el:
        if child.tag == 'content':
            data['content'] = convert_content(child)
        elif child.tag == 'num':
            data['marker'] = child.text
        else:
            data['children'].append(convert_node(child))
    return {**xml_el.attrib, **data}


class AkomaNtosoParser(BaseParser):
    media_type = 'application/akn+xml'

    def parse(self, stream, media_type=None, parser_context=None):
        try:
            root = etree.fromstring(stream.read().decode('utf-8'))
        except etree.XMLSyntaxError as e:
            raise ParseError(f'XML syntax error - {e}')
        return convert_node(root)
