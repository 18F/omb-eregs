from document.tree import DocCursor
from ombpdf.management.commands import migrate_documents


def test_ensure_listitem_in_list():
    root = DocCursor.new_tree('root')
    list_el = root.add_child('list')
    list_el.add_child('listitem', '1')
    root.add_child('listitem', '2')
    root.add_child('listitem', '3')
    assert [n.identifier for n in root.walk()] == [
        'root_1',
        'root_1__list_1',
        'root_1__list_1__listitem_1',
        'root_1__listitem_2',
        'root_1__listitem_3',
    ]

    root = migrate_documents.ensure_listitem_in_list(root)
    assert [n.identifier for n in root.walk()] == [
        'root_1',
        'root_1__list_1',
        'root_1__list_1__listitem_1',
        'root_1__list_1__listitem_2',
        'root_1__list_1__listitem_3',
    ]


def test_ensure_section_has_heading():
    root = DocCursor.new_tree('root')
    sec1 = root.add_child('sec')
    sec1.add_child('sec')
    sec12 = sec1.add_child('sec')
    sec12.add_child('heading', text='Subheading')
    root.add_child('sec')

    root = migrate_documents.ensure_section_has_heading(root)
    assert root['sec_1']['heading_1'].text == '--Missing Heading--'
    assert root['sec_1']['sec_1']['heading_1'].text == '--Missing Heading--'
    assert root['sec_1']['sec_2']['heading_1'].text == 'Subheading'
    assert root['sec_2']['heading_1'].text == '--Missing Heading--'
