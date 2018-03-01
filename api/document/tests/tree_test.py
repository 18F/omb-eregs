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
    assert result.text == 'Root Node'


def test_item_access():
    root = tree.DocCursor.new_tree('root', '0')
    sec1 = root.add_child('sec', '1', text='section 1')
    root.add_child('sec', '2', text='section 2')
    sec1.add_child('para', 'a', text='paragraph a')
    sec1.add_child('para', 'b')

    assert root['sec_1'].text == 'section 1'
    assert root['sec_2'].text == 'section 2'
    assert root['sec_1']['para_a'].text == 'paragraph a'


def test_depths():
    root = tree.DocCursor.new_tree('root', '0')
    sec1 = root.add_child('sec')
    root.add_child('sec')
    sec1.add_child('para', 'a')
    sec1.add_child('para', 'b')

    assert root.depth == 0
    assert root['sec_1'].depth == 1
    assert root['sec_2'].depth == 1
    assert root['sec_1']['para_a'].depth == 2
    assert root['sec_1']['para_b'].depth == 2


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
    root.add_child('sec')
    root.add_child('sec')
    root.add_child('sec')
    root.add_child('appendix')
    root.add_child('appendix')

    assert root.next_emblem('sec') == '4'
    assert root.next_emblem('appendix') == '3'
    assert set(root.tree.nodes()) == {
        'root_0', 'root_0__sec_1', 'root_0__sec_2', 'root_0__sec_3',
        'root_0__appendix_1', 'root_0__appendix_2',
    }


def test_walk():
    root = tree.DocCursor.new_tree('root', '0')
    sec1 = root.add_child('sec')
    sec2 = root.add_child('sec')
    sec1.add_child('para', 'a')
    sec1.add_child('para', 'b')
    sec2.add_child('para', '1')

    idents = [n.identifier for n in root.walk()]
    assert idents == [
        'root_0', 'root_0__sec_1', 'root_0__sec_1__para_a',
        'root_0__sec_1__para_b', 'root_0__sec_2', 'root_0__sec_2__para_1',
    ]


def test_nested_sets():
    root = tree.DocCursor.new_tree('root', '0')
    sec1 = root.add_child('sec')
    sec2 = root.add_child('sec')
    sec1.add_child('para', 'a')
    sec1.add_child('para', 'b')
    sec2.add_child('para', '1')

    assert root.subtree_size() == 6
    assert root.left is None
    assert root.right is None

    root.nested_set_renumber(bulk_create=False)

    assert root.left == 1
    assert root['sec_1'].left == 2
    assert root['sec_1']['para_a'].left == 3
    assert root['sec_1']['para_a'].right == 4
    assert root['sec_1']['para_b'].left == 5
    assert root['sec_1']['para_b'].right == 6
    assert root['sec_1'].right == 7
    assert root['sec_2'].left == 8
    assert root['sec_2']['para_1'].left == 9
    assert root['sec_2']['para_1'].right == 10
    assert root['sec_2'].right == 11
    assert root.right == 12


def test_parent():
    root = tree.DocCursor.new_tree('root', '0')
    root.add_child('sec')
    sec2 = root.add_child('sec')
    pa = sec2.add_child('para', 'a')
    pa.add_child('para', '1')
    sec2.add_child('para', 'b')

    assert root.parent() is None
    assert root['sec_1'].parent().identifier == 'root_0'
    assert root['sec_2'].parent().identifier == 'root_0'
    assert root['sec_2']['para_a'].parent().identifier == 'root_0__sec_2'
    assert root['sec_2']['para_b'].parent().identifier == 'root_0__sec_2'
    assert root['sec_2']['para_a']['para_1'].parent().identifier \
        == 'root_0__sec_2__para_a'


def test_ancestors():
    root = tree.DocCursor.new_tree('root', '0')
    root.add_child('sec')
    sec2 = root.add_child('sec')
    pa = sec2.add_child('para', 'a')
    pa1 = pa.add_child('para', '1')
    pa1.add_child('para', 'i')
    sec2.add_child('para', 'b')

    assert [n.identifier for n in root.ancestors()] == []
    result = [n.identifier
              for n in root['sec_2']['para_a']['para_1'].ancestors()]
    assert result == [
        'root_0__sec_2__para_a',
        'root_0__sec_2',
        'root_0',
    ]
    result = [
        n.identifier
        for n in root['sec_2']['para_a']['para_1']['para_i'].ancestors(
            lambda n: n.node_type == 'para')
    ]
    assert result == ['root_0__sec_2__para_a__para_1', 'root_0__sec_2__para_a']
    result = [
        n.identifier
        for n in root['sec_2']['para_a']['para_1']['para_i'].ancestors(
            lambda n: n.node_type == 'sec')
    ]
    assert result == ['root_0__sec_2']


@pytest.mark.django_db
def test_create_save_load():
    """Integration test that shows we get the same results when converting
    data from the database."""
    policy = mommy.make(Policy)
    root = tree.DocCursor.new_tree('root', '0', text='Root', policy=policy)
    sec1 = root.add_child('sec', text='First Section')
    sec1.add_child('para', 'a')
    sec1.add_child('para', 'b', text='Paragraph b')
    root.add_child('sec')
    app1 = root.add_child('appendix')
    app1.add_child('apppar', 'i', text='Appendix par i')

    root.nested_set_renumber()

    assert DocNode.objects.count() == 7
    model_root = DocNode.objects.get(identifier='root_0')
    new_root = tree.DocCursor.load_from_model(model_root)

    assert new_root.subtree_size() == 7
    assert new_root.text == 'Root'
    assert new_root['sec_1'].text == 'First Section'
    assert new_root['sec_1']['para_b'].text == 'Paragraph b'
    assert new_root['appendix_1']['apppar_i'].text == 'Appendix par i'


def test_add_models():
    """We can return to a tree structure from a sequence of models."""
    root = random_doc(15)
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


@pytest.mark.django_db
def test_default_policy():
    policy1, policy2 = mommy.make(Policy, _quantity=2)
    root = tree.DocCursor.new_tree('root', policy=policy1)
    root.add_child('sec')
    root.add_child('sec', policy=policy2)

    assert root.policy == policy1
    assert root['sec_1'].policy == policy1
    assert root['sec_2'].policy == policy2


def test_jump_to():
    root = tree.DocCursor.new_tree('root', '1')
    root.add_child('sec')
    root['sec_1'].add_child('para', 'a')
    root.add_child('sec')
    para_a = root['sec_2'].add_child('para', 'a')

    assert root.jump_to('root_1').identifier == 'root_1'
    assert para_a.jump_to('root_1').identifier == 'root_1'
    assert para_a.jump_to('root_1__sec_1').identifier == 'root_1__sec_1'


def test_add_child_insert_pos():
    root = tree.DocCursor.new_tree('root')
    root.add_child('sec', '1')
    root.add_child('sec', '2')
    root.add_child('sec', '3')

    assert [n.identifier for n in root.walk()] == [
        'root_1', 'root_1__sec_1', 'root_1__sec_2', 'root_1__sec_3']

    root.add_child('sec', '4', insert_pos=1)
    assert [n.identifier for n in root.walk()] == [
        'root_1', 'root_1__sec_1', 'root_1__sec_4', 'root_1__sec_2',
        'root_1__sec_3',
    ]


def test_siblings():
    root = tree.DocCursor.new_tree('root')
    s1 = root.add_child('sec', '1')
    s2 = root.add_child('sec', '2')
    s3 = root.add_child('sec', '3')
    s4 = root.add_child('sec', '4')
    s1.add_child('para')
    s3.add_child('para')

    assert [s.identifier for s in s3.left_siblings()] == [
        s1.identifier, s2.identifier]
    assert [s.identifier for s in s3.right_siblings()] == [s4.identifier]
    assert s1.left_sibling() is None
    assert s1.right_sibling().identifier == s2.identifier
    assert s2.left_sibling().identifier == s1.identifier


def test_append_to():
    root = tree.DocCursor.new_tree('root')
    s1 = root.add_child('sec')
    s1.add_child('para')
    p12 = s1.add_child('para')
    p12.add_child('math')
    s2 = root.add_child('sec')
    s2.add_child('para')
    list_el = s2.add_child('list')
    list_el.add_child('listitem')
    list_el.add_child('listitem')

    assert [n.identifier for n in root.walk()] == [
        'root_1',
        'root_1__sec_1',
        'root_1__sec_1__para_1',
        'root_1__sec_1__para_2',
        'root_1__sec_1__para_2__math_1',
        'root_1__sec_2',
        'root_1__sec_2__para_1',
        'root_1__sec_2__list_1',
        'root_1__sec_2__list_1__listitem_1',
        'root_1__sec_2__list_1__listitem_2',
    ]

    list_el.append_to(p12)
    assert [n.identifier for n in root.walk()] == [
        'root_1',
        'root_1__sec_1',
        'root_1__sec_1__para_1',
        'root_1__sec_1__para_2',
        'root_1__sec_1__para_2__math_1',
        'root_1__sec_1__para_2__list_1',
        'root_1__sec_1__para_2__list_1__listitem_1',
        'root_1__sec_1__para_2__list_1__listitem_2',
        'root_1__sec_2',
        'root_1__sec_2__para_1',
    ]
