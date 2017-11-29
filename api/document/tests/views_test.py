import json
import random

import pytest
from django.test.utils import CaptureQueriesContext
from model_mommy import mommy

from document.serializers.doc_cursor import DocCursorSerializer
from document.tests.utils import random_doc
from document.tree import DocCursor
from reqs.models import Policy


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_404s(client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.add_child('sect')
    root.nested_set_renumber()

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
    sect1 = root.add_child('sect')
    root.add_child('sect')
    sect1.add_child('par', 'a')
    root.nested_set_renumber()

    def result(url):
        return json.loads(client.get(url).content.decode('utf-8'))

    def serialize(node):
        return DocCursorSerializer(node, context={'policy': policy}).data

    assert result(f"/{policy.pk}") == serialize(root)
    assert result(f"/{policy.pk}/root_0") == serialize(root)
    assert result(f"/{policy.pk}/root_0__sect_1") == serialize(root['sect_1'])
    assert result(f"/{policy.pk}/root_0__sect_2") == serialize(root['sect_2'])
    assert result(f"/{policy.pk}/root_0__sect_1__par_a") \
        == serialize(root['sect_1']['par_a'])


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_by_pretty_url(client):
    policy = mommy.make(Policy, omb_policy_id='M-Something-18')
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.nested_set_renumber()

    result = json.loads(client.get("/M-Something-18").content.decode("utf-8"))

    assert result == DocCursorSerializer(root,
                                         context={'policy': policy}).data


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_query_count(client):
    policy = mommy.make(Policy, omb_policy_id='M-O-A-R')
    root = random_doc(20, save=True, policy=policy, text='placeholder')

    # select 3 nodes to have external links
    for node in random.sample(list(root.walk()), 3):
        node.model.externallinks.create(start=1, end=2,
                                        href='http://example.com/')

    # select 3 nodes to add footnote citations
    citing_nodes = random.sample(list(root.walk()), 3)
    footnotes = [citing.add_child('footnote') for citing in citing_nodes]
    root.nested_set_renumber(bulk_create=False)
    for node in root.walk():
        node.model.save()
    for citing, footnote in zip(citing_nodes, footnotes):
        citing.model.footnotecitations.create(start=0, end=1,
                                              footnote_node=footnote.model)
    # pytest will alter the connection, so we only want to load it within this
    # test
    from django.db import connection
    with CaptureQueriesContext(connection) as capture:
        client.get("/M-O-A-R")
        # Query 1: Lookup the policy
        # 2: Lookup the root docnode
        # 3: fetch footnote citations _and_ referenced node for the root
        # 4: fetch external links for the root
        # 5: fetch child nodes
        # 6: fetch footnote citations _and_ referenced node for child nodes
        # 7: fetch external links for child nodes
        assert len(capture) == 7
