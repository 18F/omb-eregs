from ombpdf.eqnamedtuple import eqnamedtuple


def test_name_works():
    Blah = eqnamedtuple('Blah', ['u'])

    assert Blah.__name__ == 'Blah'


def test_eq_works():
    Foo = eqnamedtuple('Foo', ['foo'])
    Bar = eqnamedtuple('Bar', ['bar'])

    assert Foo(1) != Bar(1)
    assert Foo(1) == Foo(1)
    assert Bar('a') == Bar('a')
