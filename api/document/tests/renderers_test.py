from lxml import etree

from document import renderers

empty_node = {
    'children': [],
    'content': [],
    'identifier': '',
    'marker': '',
    'node_type': 'some_type',
    'title': '',
}


def test_node_to_xml_parent():
    root = renderers.node_to_xml({**empty_node, 'node_type': 'is_root'})
    assert root.tag == 'is_root'
    assert root.getparent() is None

    child = renderers.node_to_xml({**empty_node, 'node_type': 'is_child'},
                                  root)
    assert child.tag == 'is_child'
    assert child.getparent() is not None
    assert child.getparent().tag == 'is_root'


def test_node_to_xml_content():
    result = renderers.node_to_xml(empty_node)
    assert result.findtext('content') is None

    result = renderers.node_to_xml({
        **empty_node,
        'content': [{'content_type': '__text__', 'text': 'Some text'}],
    })
    assert result.findtext('content') == 'Some text'


def test_node_to_xml_recurses():
    node = {
        **empty_node,
        'node_type': 'root',
        'children': [
            {
                **empty_node,
                'node_type': 'child',
            }, {
                **empty_node,
                'node_type': 'child',
                'children': [{**empty_node, 'node_type': 'subchild'}],
            },
        ],
    }
    result = renderers.node_to_xml(node)
    assert result.tag == 'root'
    assert len(result.findall('child')) == 2
    assert list(result.findall('child')[0]) == []
    assert result.find('./child/subchild') is not None


def test_add_node_attrs_id():
    xml_el = etree.fromstring('<node />')
    renderers.add_node_attrs({**empty_node, 'identifier': 'ididid'}, xml_el)
    assert xml_el.attrib['id'] == 'ididid'


def test_add_node_attrs_marker():
    xml_el = etree.fromstring('<node />')
    renderers.add_node_attrs(empty_node, xml_el)
    assert xml_el.find('num') is None

    renderers.add_node_attrs({**empty_node, 'marker': 'abcdef'}, xml_el)
    assert xml_el.findtext('num') == 'abcdef'


def test_add_node_attrs_title():
    xml_el = etree.fromstring('<node />')
    renderers.add_node_attrs(empty_node, xml_el)
    assert 'title' not in xml_el.attrib

    renderers.add_node_attrs({**empty_node, 'title': 'abcdef'}, xml_el)
    assert xml_el.attrib.get('title') == 'abcdef'


def test_add_content_just_text():
    xml_el = etree.fromstring('<content />')
    renderers.add_content(
        [{'content_type': '__text__', 'inlines': [], 'text': 'some things'}],
        xml_el
    )
    assert etree.tostring(xml_el) == b'<content>some things</content>'


def test_add_content_one_tag():
    xml_el = etree.fromstring('<content />')
    renderers.add_content(
        [{
            'content_type': 'stuff',
            'inlines': [{'content_type': '__text__', 'text': 'some things'}],
        }],
        xml_el
    )
    assert etree.tostring(xml_el) == (
        b'<content><stuff>some things</stuff></content>')


def test_add_content_attrib():
    xml_el = etree.fromstring('<content />')
    renderers.add_content(
        [{
            'content_type': 'stuff',
            'href': 'http://bop',
            'inlines': [],
        }],
        xml_el
    )
    assert etree.tostring(xml_el) == (
        b'<content><stuff href="http://bop"/></content>')


def test_add_content_nested():
    content = [
        {'content_type': '__text__', 'text': 'Beginning '},
        {
            'content_type': 'wrapper',
            'inlines': [
                {
                    'content_type': 'inner',
                    'inlines': [{'content_type': '__text__', 'text': 'stuff'}],
                },
                {'content_type': '__text__', 'text': ' '},
                {
                    'content_type': 'inner2',
                    'inlines': [{'content_type': '__text__', 'text': 'again'}],
                },
            ],
        },
        {'content_type': '__text__', 'text': ' ending.'},
    ]
    xml_el = etree.fromstring('<content />')
    renderers.add_content(content, xml_el)
    assert etree.tostring(xml_el) == (
        b'<content>Beginning <wrapper>'
        b'<inner>stuff</inner> <inner2>again</inner2>'
        b'</wrapper> ending.</content>'
    )


def test_renderer_pretty():
    node = {
        **empty_node,
        'identifier': 'some-id',
        'marker': '1)',
        'node_type': 'a_node',
        'content': [
            {'content_type': '__text__', 'text': 'Beginning '},
            {
                'content_type': 'wrapper',
                'inlines': [{'content_type': '__text__', 'text': 'stuff'}],
            },
        ],
    }
    assert renderers.AkomaNtosoRenderer().render(node) == (
        b'<a_node id="some-id">\n'
        b'  <num>1)</num>\n'
        b'  <content>Beginning <wrapper>stuff</wrapper></content>\n'
        b'</a_node>\n'
    )


def test_browsable_akn_uses_akn_renderer():
    assert isinstance(
        renderers.BrowsableAkomaNtosoRenderer().get_default_renderer(None),
        renderers.AkomaNtosoRenderer
    )
