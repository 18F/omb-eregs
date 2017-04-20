from unittest.mock import Mock, call

import pytest
from django.contrib.auth.models import User
from model_mommy import mommy

from ereqs_admin import max_backend


@pytest.fixture
def max_setup(monkeypatch):
    monkeypatch.setattr(max_backend, 'get_cas_client', Mock())
    attributes = {
        'First-Name': 'Freddie',
        'Last-Name': 'Mercury',
        'Email-Address': 'fred@example.com',
    }
    verify_ticket = max_backend.get_cas_client.return_value.verify_ticket
    verify_ticket.return_value = (Mock(), attributes, Mock())


@pytest.mark.django_db
@pytest.mark.usefixtures('max_setup')
def test_authenticate_success():
    """Verify that a user is configured correctly"""
    get_cas_client = max_backend.get_cas_client
    verify_ticket = get_cas_client.return_value.verify_ticket
    user = mommy.make(User, is_staff=False, username='fred@example.com')

    backend = max_backend.MAXBackend()
    backend.authenticate(Mock(), 'some-ticket', 'service-url')

    assert get_cas_client.call_args == call(service_url='service-url')
    assert verify_ticket.call_args == call('some-ticket')

    user = User.objects.get(pk=user.pk)
    assert user.first_name == 'Freddie'
    assert user.last_name == 'Mercury'
    assert user.email == 'fred@example.com'
    assert user.is_staff


@pytest.mark.django_db
@pytest.mark.usefixtures('max_setup')
def test_authenticate_failure_unknown_user():
    """If MAX knows about the user but Django does not, we should fail"""
    assert User.objects.count() == 0

    backend = max_backend.MAXBackend()
    result = backend.authenticate(Mock(), 'some-ticket', 'service-url')
    assert result is None
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_authenticate_ticket_failure(monkeypatch):
    """If MAX isn't aware of the user, we shouldn't explode (nor create a new
    user)"""
    monkeypatch.setattr(max_backend, 'get_cas_client', Mock())
    verify_ticket = max_backend.get_cas_client.return_value.verify_ticket
    verify_ticket.return_value = (None, Mock(), Mock())

    assert User.objects.count() == 0

    backend = max_backend.MAXBackend()
    result = backend.authenticate(Mock(), 'some-ticket', 'service-url')
    assert result is None
    assert User.objects.count() == 0
