from document import serializers
from document.models import DocNode


def test_end_to_end():
    """Create a tree, then serialize it."""
    root = DocNode.new_tree('root', '0')
    root.add_child('sect', text='Section 1')
    sect2 = root.add_child('sect')
    pa = sect2.add_child('par', 'a')
    pa.add_child('par', '1', text='Paragraph (a)(1)')
    sect2.add_child('par', 'b')

    result = serializers.DocCursorSerializer(root).data
    assert result == {
        'identifier': 'root_0',
        'node_type': 'root',
        'type_emblem': '0',
        'text': '',
        'depth': 0,
        'children': [
            {
                'identifier': 'root_0__sect_1',
                'node_type': 'sect',
                'type_emblem': '1',
                'text': 'Section 1',
                'depth': 1,
                'children': [],
            },
            {
                'identifier': 'root_0__sect_2',
                'node_type': 'sect',
                'type_emblem': '2',
                'text': '',
                'depth': 1,
                'children': [
                    {
                        'identifier': 'root_0__sect_2__par_a',
                        'node_type': 'par',
                        'type_emblem': 'a',
                        'text': '',
                        'depth': 2,
                        'children': [
                            {
                                'identifier': 'root_0__sect_2__par_a__par_1',
                                'node_type': 'par',
                                'type_emblem': '1',
                                'text': 'Paragraph (a)(1)',
                                'depth': 3,
                                'children': [],
                            },
                        ],
                    },
                    {
                        'identifier': 'root_0__sect_2__par_b',
                        'node_type': 'par',
                        'type_emblem': 'b',
                        'text': '',
                        'depth': 2,
                        'children': [],
                    },
                ],
            },
        ],
    }
