from document import models


def test_new_tree():
    result = models.DocNode.new_tree('root', '0', text='Root Node')
    assert result.identifier == 'root_0'
    assert set(result.tree.nodes()) == {'root_0'}
    assert len(result.tree.edges) == 0
    assert result.model.text == 'Root Node'


def test_item_access():
    root = models.DocNode.new_tree('root', '0')
    sec1 = root.add_child('sect', '1', text='section 1')
    root.add_child('sect', '2', text='section 2')
    sec1.add_child('par', 'a', text='paragraph a')
    sec1.add_child('par', 'b')

    assert root['sect_1'].model.text == 'section 1'
    assert root['sect_2'].model.text == 'section 2'
    assert root['sect_1']['par_a'].model.text == 'paragraph a'


def test_children_are_sorted():
    root = models.DocNode.new_tree('root', '0')
    root.add_child('sec', 'a')
    root.add_child('sec', '1')
    root.add_child('sec', '0')
    root.add_child('sec', 'A')
    children = [c.identifier for c in root.children()]
    assert children == ['root_0__sec_a', 'root_0__sec_1', 'root_0__sec_0',
                        'root_0__sec_A']


def test_next_emblem():
    root = models.DocNode.new_tree('root', '0')
    root.add_child('sect')
    root.add_child('sect')
    root.add_child('sect')
    root.add_child('appendix')
    root.add_child('appendix')

    assert root.next_emblem('sect') == '4'
    assert root.next_emblem('appendix') == '3'
    assert set(root.tree.nodes()) == {
        'root_0', 'root_0__sect_1', 'root_0__sect_2', 'root_0__sect_3',
        'root_0__appendix_1', 'root_0__appendix_2',
    }
