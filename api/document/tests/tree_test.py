import pytest
from model_mommy import mommy

from document import tree
from document.models import DocNode
from document.tests.utils import random_doc
from reqs.models import Policy


def test_new_tree():
    result = tree.DocCursor.new_tree('root', '0', text='Root Node')
    assert result.identifier == 'root_0'
    assert set(result.tree.nodes()) == {'root_0'}
    assert len(result.tree.edges) == 0
    assert result.model.text == 'Root Node'


def test_item_access():
    root = tree.DocCursor.new_tree('root', '0')
    sec1 = root.add_child('sect', '1', text='section 1')
    root.add_child('sect', '2', text='section 2')
    sec1.add_child('par', 'a', text='paragraph a')
    sec1.add_child('par', 'b')

    assert root['sect_1'].model.text == 'section 1'
    assert root['sect_2'].model.text == 'section 2'
    assert root['sect_1']['par_a'].model.text == 'paragraph a'


def test_depths():
    root = tree.DocCursor.new_tree('root', '0')
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
    root = tree.DocCursor.new_tree('root', '0')
    root.add_child('sec', 'a')
    root.add_child('sec', '1')
    root.add_child('sec', '0')
    root.add_child('sec', 'A')
    children = [c.identifier for c in root.children()]
    assert children == ['root_0__sec_a', 'root_0__sec_1', 'root_0__sec_0',
                        'root_0__sec_A']


def test_next_emblem():
    root = tree.DocCursor.new_tree('root', '0')
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
    root = tree.DocCursor.new_tree('root', '0')
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
    root = tree.DocCursor.new_tree('root', '0')
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


def test_parent():
    root = tree.DocCursor.new_tree('root', '0')
    root.add_child('sect')
    sect2 = root.add_child('sect')
    pa = sect2.add_child('par', 'a')
    pa.add_child('par', '1')
    sect2.add_child('par', 'b')

    assert root.parent() is None
    assert root['sect_1'].parent().identifier == 'root_0'
    assert root['sect_2'].parent().identifier == 'root_0'
    assert root['sect_2']['par_a'].parent().identifier == 'root_0__sect_2'
    assert root['sect_2']['par_b'].parent().identifier == 'root_0__sect_2'
    assert root['sect_2']['par_a']['par_1'].parent().identifier \
        == 'root_0__sect_2__par_a'


@pytest.mark.django_db
def test_create_save_load():
    """Integration test that shows we get the same results when converting
    data from the database."""
    policy = mommy.make(Policy)
    root = tree.DocCursor.new_tree('root', '0', text='Root', policy=policy)
    sect1 = root.add_child('sect', text='First Section', policy=policy)
    sect1.add_child('par', 'a', policy=policy)
    sect1.add_child('par', 'b', text='Paragraph b', policy=policy)
    root.add_child('sect', policy=policy)
    app1 = root.add_child('appendix', policy=policy)
    app1.add_child('apppar', 'i', text='Appendix par i', policy=policy)

    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())

    assert DocNode.objects.count() == 7
    model_root = DocNode.objects.get(identifier='root_0')
    new_root = tree.DocCursor.load_from_model(model_root)

    assert new_root.subtree_size() == 7
    assert new_root.model.text == 'Root'
    assert new_root['sect_1'].model.text == 'First Section'
    assert new_root['sect_1']['par_b'].model.text == 'Paragraph b'
    assert new_root['appendix_1']['apppar_i'].model.text == 'Appendix par i'


def test_add_models():
    """We can return to a tree structure from a sequence of models."""
    root = random_doc(15)
    root.nested_set_renumber()
    models_created = [node.model for node in root.walk()]
    correct_order = [node.identifier for node in root.walk()]

    new_root = tree.DocCursor.load_from_model(models_created.pop(0),
                                              subtree=False)
    new_root.add_models(models_created)
    current_order = [node.identifier for node in new_root.walk()]

    assert current_order == correct_order


def test_filter():
    root = tree.DocCursor.new_tree('root', '1')
    root.add_child('sec')
    root.add_child('sec')
    root['sec_1'].add_child('para')
    root['sec_1'].add_child('para')
    root['sec_1']['para_2'].add_child('sec')

    filtered = root.filter(lambda m: m.node_type == 'sec')
    assert [n.identifier for n in filtered] == [
        'root_1__sec_1', 'root_1__sec_2', 'root_1__sec_1__para_2__sec_1']

    filtered = root.filter(lambda m: m.type_emblem == '2')
    assert [n.identifier for n in filtered] == [
        'root_1__sec_2', 'root_1__sec_1__para_2']
