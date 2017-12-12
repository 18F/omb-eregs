from collections import namedtuple


def eqnamedtuple(typename, field_names):
    '''
    Factory function for creating a namedtuple subclass that
    features stricter equality, in that for the '==' operator
    to work, each operand must also have the exact same
    class.

    For instance, normal namedtuples are equal even if they
    are of different classes, so long as the tuple elements
    themselves are equal:

        >>> Foo = namedtuple('Foo', ['foo'])
        >>> Bar = namedtuple('Bar', ['bar'])
        >>> Foo(1) == Bar(1)
        True

    However, with eqnamedtuple(), this won't work:

        >>> Foo = eqnamedtuple('Foo', ['foo'])
        >>> Bar = eqnamedtuple('Bar', ['bar'])
        >>> Foo(1) == Bar(1)
        False

    Instead, the tuple subclasses themselves must match exactly:

        >>> Foo(1) == Foo(1)
        True
    '''

    class Result(namedtuple(typename, field_names)):
        __slots__ = ()

        def __eq__(self, other):
            return (other and other.__class__ == self.__class__
                    and tuple(self) == tuple(other))

        def __ne__(self, other):
            return not self.__eq__(other)

    Result.__name__ = typename

    return Result
