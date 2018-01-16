from unittest.mock import Mock

import pytest

from document.json_importer.annotations import derive_annotations
from document.json_importer.importer import convert_node
from document.models import ExternalLink, FootnoteCitation

from .. import factories as f


def test_derive_annotations_works_on_children():
    para = convert_node(f.para(content=[f.text('hi')], children=[
        f.para(content=[f.external_link('http://one.org', [
            f.text('blah')
        ])])
    ]))

    annos = derive_annotations(para)

    assert len(annos) == 1
    links = annos[ExternalLink]
    assert len(links) == 1


def test_derive_annotations_works_with_nested_content():
    para = convert_node(f.para(content=[
        f.external_link('http://one.org', [
            f.text('foo'),
            f.external_link('http://two.org', [f.text('bar')]),
            f.text('baz'),
            f.external_link('http://three.org', [f.text('quux')]),
        ])
    ]))

    annos = derive_annotations(para)

    assert len(annos) == 1

    links = annos[ExternalLink]
    assert len(links) == 3

    one = links[0]
    assert para.text[one.start:one.end] == 'foobarbazquux'

    two = links[1]
    assert para.text[two.start:two.end] == 'bar'

    three = links[2]
    assert para.text[three.start:three.end] == 'quux'


def test_derive_annotations_works_with_external_link():
    annos = derive_annotations(convert_node(f.para(content=[
        f.text('Hello '),
        f.external_link('http://example.org/', [f.text('there')])
    ])))

    assert len(annos) == 1
    assert len(annos[ExternalLink]) == 1
    link = annos[ExternalLink][0]
    assert link.href == 'http://example.org/'
    assert link.start == len('Hello ')
    assert link.end == link.start + len('there')


def test_derive_annotations_works_with_footnote_citation():
    para = convert_node(f.para(
        content=[f.footnote_citation([f.text('3')])],
        children=[f.footnote(3, content=[f.text('Hi I am a footnote')])]
    ))

    annos = derive_annotations(para)

    assert len(annos) == 1
    assert len(annos[FootnoteCitation]) == 1
    cit = annos[FootnoteCitation][0]
    assert cit.start == 0
    assert cit.end == 1
    assert cit.footnote_node.text == 'Hi I am a footnote'


def test_derive_annotations_raises_err_on_invalid_footnote_citation():
    para = convert_node(f.para(
        content=[f.footnote_citation([f.text('3')])],
        children=[f.footnote(4, content=[f.text('Hi I am a footnote')])]
    ))

    with pytest.raises(ValueError,
                       match="unable to find footnote for citation 3"):
        derive_annotations(para)


def test_derive_annotations_raises_err_on_invalid_annotation():
    para = Mock(json_content=[{'content_type': 'blarg'}])

    with pytest.raises(ValueError,
                       match="no annotator found for blarg"):
        derive_annotations(para)
