import pytest
import reversion
from django.http import QueryDict
from model_mommy import mommy
from reversion.models import Version

from reqs.admin import RequirementForm
from reqs.models import Policy, Requirement, Topic


def test_reqs_in_topics(admin_client):
    """We can see a listing of requirements within the topic edit screen"""
    req1, req2, req3 = mommy.make(Requirement, _quantity=3)
    key1 = mommy.make(Topic, name='key1')
    key2 = mommy.make(Topic, name='key2')
    key3 = mommy.make(Topic, name='key3')
    key4 = mommy.make(Topic, name='key4')
    req1.topics.add('key1', 'key2')
    req2.topics.add('key2', 'key3')
    req3.topics.add('key3', 'key4')

    def admin_text(pk):
        resp = admin_client.get('/admin/reqs/topic/{0}/change/'.format(pk))
        return resp.content.decode('utf-8')

    result = admin_text(key1.pk)
    assert req1.req_id in result
    assert req2.req_id not in result
    assert req3.req_id not in result

    result = admin_text(key2.pk)
    assert req1.req_id in result
    assert req2.req_id in result
    assert req3.req_id not in result

    result = admin_text(key3.pk)
    assert req1.req_id not in result
    assert req2.req_id in result
    assert req3.req_id in result

    result = admin_text(key4.pk)
    assert req1.req_id not in result
    assert req2.req_id not in result
    assert req3.req_id in result


def test_reqs_in_policy(admin_client):
    """We can see a listing of requirements within the policy edit screen"""
    policy1, policy2, policy3 = mommy.make(Policy, _quantity=3)
    req1 = mommy.make(Requirement, policy=policy1)
    req2 = mommy.make(Requirement, policy=policy1)
    req3 = mommy.make(Requirement, policy=policy2)

    def admin_text(pk):
        resp = admin_client.get('/admin/reqs/policy/{0}/change/'.format(pk))
        return resp.content.decode('utf-8')

    result = admin_text(policy1.pk)
    assert req1.req_id in result
    assert req2.req_id in result
    assert req3.req_id not in result

    result = admin_text(policy2.pk)
    assert req1.req_id not in result
    assert req2.req_id not in result
    assert req3.req_id in result

    result = admin_text(policy3.pk)
    assert req1.req_id not in result
    assert req2.req_id not in result
    assert req3.req_id not in result


def test_topics_displayed(admin_client):
    """Existing topics should be in the markup of a requirement edit page"""
    topics = mommy.make(Topic, _quantity=4)
    req = mommy.make(Requirement)
    req.topics.add(*[topic.name for topic in topics])

    resp = admin_client.get('/admin/reqs/requirement/{0}/change/'.format(
        req.pk))
    markup = resp.content.decode('utf-8')
    for topic in topics:
        assert topic.name in markup


def req_query_str():
    """Create a requirement and generate the query string associated with
    it"""
    req = mommy.prepare(Requirement, policy=mommy.make(Policy))
    fields = {f.name: getattr(req, f.name) for f in req._meta.fields}
    fields['policy'] = req.policy_id
    return '&'.join('{0}={1}'.format(k, v) for k, v in fields.items())


@pytest.mark.parametrize('tags', [
    [],
    ["one"],
    ["has space"],
    ["has, commas", "more things"],
    ["a", "b", "c", "d"],
])
@pytest.mark.django_db
def test_taggit_widget(tags):
    query_str = req_query_str()
    for tag in tags:
        query_str += '&topics=' + tag
    data = QueryDict(query_str)
    form = RequirementForm(data)
    req = form.save()

    assert list(sorted(req.topics.names())) == list(sorted(tags))


@pytest.mark.parametrize('tag, expected', [
    ('This "Has" Quotes', 'This “Has” Quotes'),
    ('This+"Has"+Quotes', 'This “Has” Quotes'),
    ('This+Has+No+Quotes', 'This Has No Quotes'),
    ('This+Has+One"+Quote', 'This Has One Quote'),
])
@pytest.mark.django_db
def test_taggit_widget_doublequotes(tag, expected):
    query_str = req_query_str()
    data = QueryDict(query_str + '&topics={0}'.format(tag))

    form = RequirementForm(data)
    req = form.save()

    assert list(req.topics.names()) == [expected]


@pytest.mark.django_db
def test_reversion(admin_client):
    with reversion.create_revision():
        key = mommy.make(Topic, name="key1")

    key_from_db = Topic.objects.get(pk=key.pk)
    assert key.name == key_from_db.name

    with reversion.create_revision():
        key_from_db.name = "new name"
        key_from_db.save()

    key.refresh_from_db()
    assert key.name == "new name"
    assert key_from_db.name == "new name"

    versions = Version.objects.get_for_model(Topic)
    assert len(versions) == 2
    assert versions[1].field_dict["name"] == "key1"
    assert versions[0].field_dict["name"] == "new name"

    versions[1].revision.revert()

    key.refresh_from_db()
    assert key.name == "key1"
