from typing import Dict, List, Optional

from lxml import etree
from rest_framework import renderers

from document.serializers.content import PlainTextSerializer

# Properties of content nodes that should *not* be converted to XML
# attributes.
NON_CONTENT_ATTRIBS = ['content_type', 'text']

# Values of content nodes that are convertible to XML attributes.
# They will be converted via `str()`.
CONTENT_ATTRIB_TYPES = (str, int)


def node_to_xml(serialized_node: Dict,
                parent: Optional[etree.Element]=None) -> etree.Element:
    if parent is None:
        xml_el = etree.Element(serialized_node['node_type'])
    else:
        xml_el = etree.SubElement(parent, serialized_node['node_type'])

    add_node_attrs(serialized_node, xml_el)

    if serialized_node['content']:
        content = etree.SubElement(xml_el, 'content')
        add_content(serialized_node['content'], content)

    # recurse
    for serialized_child in serialized_node['children']:
        node_to_xml(serialized_child, xml_el)

    return xml_el


def add_node_attrs(serialized_node: Dict, xml_el: etree.Element) -> None:
    """Set attributes corresponding to the serialized node's fields."""
    xml_el.set('id', serialized_node['identifier'])

    if serialized_node.get('type_emblem'):
        xml_el.set('emblem', serialized_node['type_emblem'])
    if serialized_node['marker']:
        num = etree.SubElement(xml_el, 'num')
        num.text = serialized_node['marker']
    if serialized_node['title']:
        xml_el.set('title', serialized_node['title'])


def add_content(serialized_content: List[Dict], parent: etree.Element) -> None:
    """Recursively converts serialized content into XML, adding that to the
    parent."""
    previous = None
    for content in serialized_content:
        if content['content_type'] != PlainTextSerializer.CONTENT_TYPE:
            child = etree.SubElement(parent, content['content_type'])
            for key, value in content.items():
                if (isinstance(value, CONTENT_ATTRIB_TYPES) and
                        key not in NON_CONTENT_ATTRIBS):
                    child.attrib[key] = str(value)
            add_content(content['inlines'], child)
            previous = child
        # parent.text vs previous.tail is a nuance of lxml
        elif previous is None:
            parent.text = content['text']
        else:
            previous.tail = content['text']


class AkomaNtosoRenderer(renderers.BaseRenderer):
    media_type = 'application/akn+xml'
    format = 'akn'  # noqa

    def render(self, data, media_type=None, renderer_context=None):
        as_xml = node_to_xml(data)
        return etree.tostring(as_xml, encoding=self.charset, pretty_print=True)


class BrowsableAkomaNtosoRenderer(renderers.BrowsableAPIRenderer):
    format = 'akn-api'  # noqa

    def get_default_renderer(self, view):
        return AkomaNtosoRenderer()
