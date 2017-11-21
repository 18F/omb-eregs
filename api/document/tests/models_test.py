import pytest
from model_mommy import mommy

from document import models


@pytest.mark.django_db
def test_content_no_annotations():
    node = mommy.make(models.DocNode, text='Some text here')
    content = node.content()
    assert len(content) == 1
    assert content[0].start == 0
    assert content[0].end == len('Some text here')
    assert isinstance(content[0], models.PlainText)


@pytest.mark.django_db
def test_content_middle_annotation():
    node = mommy.make(models.DocNode, text='Some text here')
    other_node = mommy.make(models.DocNode)
    node.footnotecitations.create(start=len('Some '), end=len('Some text'),
                                  footnote_node=other_node)
    content = node.content()

    assert len(content) == 3
    assert [node.text[c.start:c.end] for c in content] == [
        'Some ', 'text', ' here'
    ]
    assert isinstance(content[0], models.PlainText)
    assert isinstance(content[1], models.FootnoteCitation)
    assert content[1].footnote_node == other_node
    assert isinstance(content[2], models.PlainText)


@pytest.mark.django_db
def test_content_outside():
    node = mommy.make(models.DocNode, text='Some text here')
    node.externallinks.create(start=0, end=len('Some '),
                              href='http://example.com/aaa')
    node.externallinks.create(
        start=len('Some text'), end=len('Some text here'),
        href='http://example.com/bbb'
    )
    content = node.content()

    assert len(content) == 3
    assert [node.text[c.start:c.end] for c in content] == [
        'Some ', 'text', ' here'
    ]
    assert isinstance(content[0], models.ExternalLink)
    assert isinstance(content[1], models.PlainText)
    assert isinstance(content[2], models.ExternalLink)
