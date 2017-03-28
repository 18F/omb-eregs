import pytest
from django.http import QueryDict
from model_mommy import mommy

from reqs.admin import RequirementForm
from reqs.models import Keyword, Policy, Requirement


def test_reqs_in_keywords(admin_client):
    """We can see a listing of requirements within the keyword edit screen"""
    req1, req2, req3 = mommy.make(Requirement, _quantity=3)
    key1 = mommy.make(Keyword, name='key1')
    key2 = mommy.make(Keyword, name='key2')
    key3 = mommy.make(Keyword, name='key3')
    key4 = mommy.make(Keyword, name='key4')
    req1.keywords.add('key1', 'key2')
    req2.keywords.add('key2', 'key3')
    req3.keywords.add('key3', 'key4')

    def admin_text(pk):
        resp = admin_client.get('/admin/reqs/keyword/{0}/change/'.format(pk))
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
        query_str += '&keywords=' + tag
    data = QueryDict(query_str)
    form = RequirementForm(data)
    req = form.save()

    assert list(sorted(req.keywords.names())) == list(sorted(tags))


@pytest.mark.django_db
def test_taggit_widget_doublequotes():
    query_str = req_query_str()
    data = QueryDict(query_str + '&keywords=This+"Has"+Quotes')

    form = RequirementForm(data)
    req = form.save()

    assert list(req.keywords.names()) == ['This Has Quotes']
