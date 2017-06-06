import pytest
from django.contrib.auth.models import Group

from ereqs_admin import apps


@pytest.mark.django_db
def test_create_editors_creates():
    # clear out groups created w/ a post-migrate signal
    Group.objects.all().delete()

    apps.create_editors()

    assert Group.objects.count() == 1
    # three permissions per model
    assert Group.objects.first().permissions.count() == 3*8


@pytest.mark.django_db
def test_create_editors_once():
    # clear out groups created w/ a post-migrate signal
    Group.objects.all().delete()

    apps.create_editors()
    apps.create_editors()
    apps.create_editors()

    assert Group.objects.count() == 1
    # three permissions per model
    assert Group.objects.first().permissions.count() == 3*8


class MockLogger():
    def __init__(self):
        self.logs = []

    def info(self, fmt, *args):
        self.logs.append(fmt % args)    # noqa log format uses %s


def test_admin_logging(monkeypatch, admin_client):
    """Spot check that we receive logs around Group edits"""
    monkeypatch.setattr(apps, 'logger', MockLogger())
    admin_client.post('/admin/auth/group/add/', {
        'name': 'Looking For', 'permissions': '1'})
    group = Group.objects.get(name='Looking For')
    admin_client.post('/admin/auth/group/{0}/change/'.format(group.pk), {
        'name': 'Looking For Group', 'permissions': ['2']
    })

    logs = '\n'.join(apps.logger.logs)
    assert "permissions given to group 'Looking For'" in logs
    assert "admin created group 'Looking For'" in logs
    assert "<Permission:" in logs
    assert "Changed name" in logs
    assert "permissions removed from group 'Looking For Group'" in logs
