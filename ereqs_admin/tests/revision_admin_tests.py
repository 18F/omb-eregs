import json

import reversion
from model_mommy import mommy
from reversion.models import Version

from ereqs_admin import revision_admin
from reqs.models import Policy


def policy_with_version():
    policy = mommy.prepare(Policy)
    with reversion.create_revision():
        policy.save()
    return policy, Version.objects.get_for_object(policy)[0]


def test_schema_matches(admin_client):
    policy, version = policy_with_version()
    resp = admin_client.get('/admin/reqs/policy/{0}/history/{1}/'.format(
        policy.pk, version.pk)).content.decode('utf-8')
    assert revision_admin.CERTAIN_WARNING not in resp
    assert revision_admin.HEDGED_WARNING not in resp


def test_field_deleted(admin_client):
    policy, version = policy_with_version()
    data = json.loads(version.serialized_data)
    del data[0]['fields']['public']
    version.serialized_data = json.dumps(data)
    version.save()

    resp = admin_client.get('/admin/reqs/policy/{0}/history/{1}/'.format(
        policy.pk, version.pk)).content.decode('utf-8')
    assert revision_admin.CERTAIN_WARNING in resp
    assert revision_admin.HEDGED_WARNING not in resp


def test_field_added(admin_client):
    policy, version = policy_with_version()
    data = json.loads(version.serialized_data)
    data[0]['fields']['a_new_field'] = 1234
    version.serialized_data = json.dumps(data)
    version.save()

    resp = admin_client.get('/admin/reqs/policy/{0}/history/{1}/'.format(
        policy.pk, version.pk)).content.decode('utf-8')
    assert revision_admin.CERTAIN_WARNING in resp
    assert revision_admin.HEDGED_WARNING not in resp


def test_no_comparison(admin_client):
    """If there are no models in the database anymore, we can't compare."""
    policy, version = policy_with_version()
    policy.delete()

    resp = admin_client.get('/admin/reqs/policy/recover/{0}/'.format(
        version.pk)).content.decode('utf-8')
    assert revision_admin.CERTAIN_WARNING not in resp
    assert revision_admin.HEDGED_WARNING in resp
