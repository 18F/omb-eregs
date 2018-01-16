import pytest
from model_mommy import mommy

from document.json_importer.importer import convert_node, import_json_doc
from document.models import DocNode
from reqs.models import Policy

from .. import factories as f


def test_convert_paragraph_works():
    para_primitive = f.para(content=[
        f.text('Hello '),
        f.external_link('http://example.org/', [f.text('there')])
    ])
    para = convert_node(para_primitive)

    assert para.node_type == 'para'
    assert para.text == 'Hello there'
    assert para.json_content == para_primitive['content']


@pytest.mark.django_db
def test_import_json_doc_works():
    policy = mommy.make(Policy)
    para_primitive = f.para(content=[
        f.text('Hello '),
        f.external_link('http://example.org/', [f.text('there')]),
    ])
    para = import_json_doc(policy, para_primitive)

    assert para.node_type == 'para'
    assert para.text == 'Hello there'
    annos = [anno for anno in para.model.annotations()]
    assert len(annos) == 1
    assert annos[0].href == 'http://example.org/'

    para2 = import_json_doc(policy, para_primitive)
    assert para.pk != para2.pk

    assert not DocNode.objects.filter(pk=para.pk).exists()
