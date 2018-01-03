from ombpdf.eqnamedtuple import eqnamedtuple


def test_name_works():
    Blah = eqnamedtuple('Blah', ['u'])  # NOQA

    assert Blah.__name__ == 'Blah'


def test_eq_works():
    Foo = eqnamedtuple('Foo', ['foo'])  # NOQA
    Bar = eqnamedtuple('Bar', ['bar'])  # NOQA

    assert Foo(1) != Bar(1)
    assert Foo(1) == Foo(1)
    assert Bar('a') == Bar('a')
