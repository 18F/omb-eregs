import json
import random

import pytest
from django.test.utils import CaptureQueriesContext
from model_mommy import mommy

from document.models import DocNode
from document.serializers import DocCursorSerializer
from document.tests.utils import random_doc
from document.tree import DocCursor
from reqs.models import Policy, Requirement, Topic


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_404s(client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.add_child('sect', policy=policy)
    root.nested_set_renumber()
    DocNode.objects.bulk_create(n.model for n in root.walk())

    assert client.get("/987654321").status_code == 404
    assert client.get(f"/{policy.pk}").status_code == 200
    assert client.get(f"/{policy.pk}/root_0").status_code == 200
    assert client.get(f"/{policy.pk}/root_1").status_code == 404
    assert client.get(f"/{policy.pk}/root_0__sect_1").status_code == 200
    assert client.get(f"/{policy.pk}/root_0__sect_2").status_code == 404


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_correct_data(client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
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


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_query_count(client):
    policy = mommy.make(Policy)
    root = random_doc(20, save=True, policy=policy)
    subtree_nodes = {
        root.tree.nodes[idx]['model']
        for idx in root.tree.nodes()
        if idx != root.identifier
    }
    # select 5 nodes in the subtree as requirements
    req_nodes = random.sample(subtree_nodes, 5)
    reqs = mommy.make(Requirement, policy=policy, _quantity=5)

    for req_node, req in zip(req_nodes, reqs):
        for _ in range(random.randint(0, 4)):
            req.topics.add(mommy.make(Topic))
        req.docnode = req_node
        req.save()

    # pytest will alter the connection, so we only want to load it within this
    # test
    from django.db import connection
    with CaptureQueriesContext(connection) as capture:
        client.get(f"/{policy.pk}")
        # Query 1: lookup root docnode by policy pk, joining w/ req
        # 2: fetch footnote citations for the root
        # 3: fetch child nodes, joining w/ requirements
        # 4: fetch topics related to those requirements
        # 5: fetch footnote citations for child nodes
        assert len(capture) == 5
