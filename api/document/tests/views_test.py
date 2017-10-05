import json

import pytest
from model_mommy import mommy

from document.models import DocNode
from document.serializers import DocCursorSerializer
from reqs.models import Policy


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_404s(client):
    policy = mommy.make(Policy)
    root = DocNode.new_tree('root', '0', policy=policy)
    root.add_child('sect', policy=policy)
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())

    assert client.get("/000001").status_code == 404
    assert client.get(f"/{policy.pk}").status_code == 200
    assert client.get(f"/{policy.pk}/root_0").status_code == 200
    assert client.get(f"/{policy.pk}/root_1").status_code == 404
    assert client.get(f"/{policy.pk}/root_0__sect_1").status_code == 200
    assert client.get(f"/{policy.pk}/root_0__sect_2").status_code == 404


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_correct_data(client):
    policy = mommy.make(Policy)
    root = DocNode.new_tree('root', '0', policy=policy)
    sect1 = root.add_child('sect', policy=policy)
    root.add_child('sect', policy=policy)
    sect1.add_child('par', 'a', policy=policy)
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())

    def result(url):
        return json.loads(client.get(url).content.decode('utf-8'))

    assert result(f"/{policy.pk}") == DocCursorSerializer(root).data
    assert result(f"/{policy.pk}/root_0") == DocCursorSerializer(root).data
    assert result(f"/{policy.pk}/root_0__sect_1") \
        == DocCursorSerializer(root['sect_1']).data
    assert result(f"/{policy.pk}/root_0__sect_2") \
        == DocCursorSerializer(root['sect_2']).data
    assert result(f"/{policy.pk}/root_0__sect_1__par_a") \
        == DocCursorSerializer(root['sect_1']['par_a']).data
