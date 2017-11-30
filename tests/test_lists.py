from ombpdf.document import OMBListItem, OMBListItemMarker
from ombpdf.lists import annotate_lists


def test_annotate_lists_works(m_16_19_doc):
    lists = annotate_lists(m_16_19_doc)

    assert str(lists[1][1][0]).startswith('1. Transitioning to')

    assert lists[1][1][0].annotation == OMBListItem(
        list_id=1,
        number=1,
        is_ordered=True,
        indentation=1
    )
    assert lists[1][1][0][0].annotation == OMBListItemMarker(is_ordered=True)

    assert str(lists[1][2][0]).startswith('2. Migrating to inter-agency')

    assert lists[1][2][0].annotation == OMBListItem(
        list_id=1,
        number=2,
        is_ordered=True,
        indentation=1
    )

    assert str(lists[2][1][0]).startswith('• Coordinating with OMB')

    assert lists[2][1][0].annotation == OMBListItem(
        list_id=2,
        number=1,
        is_ordered=False,
        indentation=1
    )
    assert lists[2][1][0][0].annotation == OMBListItemMarker(is_ordered=False)

    assert str(lists[5][1][0]).startswith('a. A description of any')

    assert lists[5][1][0].annotation == OMBListItem(
        list_id=5,
        number=1,
        is_ordered=True,
        indentation=2,
    )
