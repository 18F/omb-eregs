import json
import random

import pytest
from django.test.utils import CaptureQueriesContext
from model_mommy import mommy

from document.serializers.doc_cursor import DocCursorSerializer
from document.tests.utils import random_doc
from document.tree import DocCursor
from reqs.models import Policy, Requirement


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_put_403s_for_anon_users(client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.nested_set_renumber()

    assert client.put(f"/{policy.pk}").status_code == 403


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
@pytest.mark.xfail(
    reason="Need to actually implement the serializer(s)!",
    raises=NotImplementedError
)
def test_put_works_for_admin_users(admin_client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.add_child('sec')
    root.nested_set_renumber()

    # Get the original document...
    response = admin_client.get(f"/{policy.pk}")
    assert response.status_code == 200
    result = response.json()

    # Modify it a bit...
    result['children'][0]['title'] = 'boop'

    response = admin_client.put(f"/{policy.pk}", data=json.dumps(result),
                                content_type='application/json')
    assert response.status_code == 200

    # Now fetch it again, and make sure our modification stuck.
    response = admin_client.get(f"/{policy.pk}")
    assert response.status_code == 200
    assert response.json()['children'][0]['title'] == 'boop'


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_404s(client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
    root.add_child('sec')
    root.nested_set_renumber()

    assert client.get("/987654321").status_code == 404
    assert client.get(f"/{policy.pk}").status_code == 200
    assert client.get(f"/{policy.pk}/root_0").status_code == 200
    assert client.get(f"/{policy.pk}/root_1").status_code == 404
    assert client.get(f"/{policy.pk}/root_0__sec_1").status_code == 200
    assert client.get(f"/{policy.pk}/root_0__sec_2").status_code == 404


@pytest.mark.django_db
@pytest.mark.urls('document.urls')
def test_correct_data(client):
    policy = mommy.make(Policy)
    root = DocCursor.new_tree('root', '0', policy=policy)
    sec1 = root.add_child('sec')
    root.add_child('sec')
    sec1.add_child('para', 'a')
    root.nested_set_renumber()

    def result(url):
        return json.loads(client.get(url).content.decode('utf-8'))

    def serialize(node):
        return DocCursorSerializer(node, context={'policy': policy}).data

    assert result(f"/{policy.pk}") == serialize(root)
    assert result(f"/{policy.pk}/root_0") == serialize(root)
    assert result(f"/{policy.pk}/root_0__sec_1") == serialize(root['sec_1'])
    assert result(f"/{policy.pk}/root_0__sec_2") == serialize(root['sec_2'])
    assert result(f"/{policy.pk}/root_0__sec_1__para_a") \
        == serialize(root['sec_1']['para_a'])


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
        node.externallinks.create(start=0, end=1, href='http://example.com/')

    # select 3 nodes to have inline requirements
    for node in random.sample(list(root.walk()), 3):
        node.inlinerequirements.create(
            start=1, end=2, requirement=mommy.make(Requirement))

    # select 3 nodes to add footnote citations
    citing_nodes = random.sample(list(root.walk()), 3)
    footnotes = [citing.add_child('footnote') for citing in citing_nodes]
    root.nested_set_renumber(bulk_create=False)
    for node in root.walk():
        node.model.save()
    for citing, footnote in zip(citing_nodes, footnotes):
        citing.footnotecitations.create(
            start=2, end=3, footnote_node=footnote.model)
    # pytest will alter the connection, so we only want to load it within this
    # test
    from django.db import connection
    with CaptureQueriesContext(connection) as capture:
        client.get("/M-O-A-R")
        # Query 01: Lookup the policy
        # 02: Lookup the root docnode
        # 03: fetch footnote citations _and_ referenced node for the root
        # 04: fetch external links for the root
        # 05: fetch inline requirements _and_ referenced req for root
        # 06: fetch cite elements for the root
        # 06: fetch nodes for table of contents
        # 08: fetch child nodes
        # 09: fetch footnote citations _and_ referenced node for child nodes
        # 10: fetch external links for child nodes
        # 11: fetch inline requirements _and_ referenced req for child nodes
        # 12: fetch cite elements for child nodes
        assert len(capture) == 12


@pytest.mark.urls('document.urls')
def test_editor_works(client):
    assert client.get('/editor').status_code == 200
