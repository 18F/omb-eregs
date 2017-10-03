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


def test_depths():
    root = models.DocNode.new_tree('root', '0')
    sec1 = root.add_child('sect')
    root.add_child('sect')
    sec1.add_child('par', 'a')
    sec1.add_child('par', 'b')

    assert root.model.depth == 0
    assert root['sect_1'].model.depth == 1
    assert root['sect_2'].model.depth == 1
    assert root['sect_1']['par_a'].model.depth == 2
    assert root['sect_1']['par_b'].model.depth == 2


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


def test_walk():
    root = models.DocNode.new_tree('root', '0')
    sect1 = root.add_child('sect')
    sect2 = root.add_child('sect')
    sect1.add_child('par', 'a')
    sect1.add_child('par', 'b')
    sect2.add_child('par', '1')

    idents = [n.identifier for n in root.walk()]
    assert idents == [
        'root_0', 'root_0__sect_1', 'root_0__sect_1__par_a',
        'root_0__sect_1__par_b', 'root_0__sect_2', 'root_0__sect_2__par_1',
    ]


def test_nested_sets():
    root = models.DocNode.new_tree('root', '0')
    sect1 = root.add_child('sect')
    sect2 = root.add_child('sect')
    sect1.add_child('par', 'a')
    sect1.add_child('par', 'b')
    sect2.add_child('par', '1')

    assert root.subtree_size() == 6
    assert root.model.left is None
    assert root.model.right is None

    root.nested_set_renumber()

    assert root.model.left == 1
    assert root['sect_1'].model.left == 2
    assert root['sect_1']['par_a'].model.left == 3
    assert root['sect_1']['par_a'].model.right == 4
    assert root['sect_1']['par_b'].model.left == 5
    assert root['sect_1']['par_b'].model.right == 6
    assert root['sect_1'].model.right == 7
    assert root['sect_2'].model.left == 8
    assert root['sect_2']['par_1'].model.left == 9
    assert root['sect_2']['par_1'].model.right == 10
    assert root['sect_2'].model.right == 11
    assert root.model.right == 12
