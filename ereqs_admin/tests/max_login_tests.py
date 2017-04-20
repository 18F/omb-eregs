from unittest.mock import Mock, call

import pytest
from django.contrib.auth.models import User
from model_mommy import mommy

from ereqs_admin import max_backend


def mock_verify_ticket(monkeypatch, exists_in_max=True, first='First',
                       last='Last', email='first.last@example.com'):
    if exists_in_max:
        attributes = {
            'First-Name': first,
            'Last-Name': last,
            'Email-Address': email,
        }
        max_username = 'max-username'
    else:
        attributes = {}
        max_username = None

    monkeypatch.setattr(max_backend, 'get_cas_client', Mock())
    verify_ticket = max_backend.get_cas_client.return_value.verify_ticket
    verify_ticket.return_value = (max_username, attributes, Mock())

    return verify_ticket


@pytest.mark.django_db
def test_authenticate_success(monkeypatch):
    """Verify that a user is configured correctly"""
    user = mommy.make(User, is_staff=False, username='fred@example.com')
    verify_ticket = mock_verify_ticket(
        monkeypatch, first='Freddie', last='Mercury', email='fred@example.com')

    backend = max_backend.MAXBackend()
    backend.authenticate(Mock(), 'some-ticket', 'service-url')

    assert max_backend.get_cas_client.call_args == call(
        service_url='service-url')
    assert verify_ticket.call_args == call('some-ticket')

    user = User.objects.get(pk=user.pk)
    assert user.first_name == 'Freddie'
    assert user.last_name == 'Mercury'
    assert user.email == 'fred@example.com'
    assert user.is_staff


@pytest.mark.django_db
def test_authenticate_failure_unknown_user(monkeypatch):
    """If MAX knows about the user but Django does not, we should fail"""
    assert User.objects.count() == 0
    mock_verify_ticket(monkeypatch)

    backend = max_backend.MAXBackend()
    result = backend.authenticate(Mock(), 'some-ticket', 'service-url')
    assert result is None
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_authenticate_ticket_failure(monkeypatch):
    """If MAX isn't aware of the user, we shouldn't explode (nor create a new
    user)"""
    assert User.objects.count() == 0
    mock_verify_ticket(monkeypatch, exists_in_max=False)

    backend = max_backend.MAXBackend()
    result = backend.authenticate(Mock(), 'some-ticket', 'service-url')
    assert result is None
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_authenticate_logging_bad_ticket(monkeypatch):
    monkeypatch.setattr(max_backend, 'logger', Mock())
    mock_verify_ticket(monkeypatch, exists_in_max=False)

    backend = max_backend.MAXBackend()
    assert backend.authenticate(Mock(), 'some-ticket', 'service-url') is None
    assert max_backend.logger.warning.called
    warning_message = max_backend.logger.warning.call_args[0][0]
    assert 'lookup was unsuccessful' in warning_message


@pytest.mark.django_db
def test_authenticate_logging_bad_email(monkeypatch):
    monkeypatch.setattr(max_backend, 'logger', Mock())
    mock_verify_ticket(monkeypatch, email='bob@example.com')
    assert User.objects.count() == 0

    backend = max_backend.MAXBackend()
    assert backend.authenticate(Mock(), 'some-ticket', 'service-url') is None
    assert max_backend.logger.warning.called
    warning_message = max_backend.logger.warning.call_args[0][0]
    assert 'referred to a user not in our system' in warning_message
    assert 'bob@example.com' in max_backend.logger.warning.call_args[0]


@pytest.mark.django_db
def test_authenticate_logging_success(monkeypatch):
    mommy.make(User, username='fred@example.com')
    monkeypatch.setattr(max_backend, 'logger', Mock())
    mock_verify_ticket(monkeypatch, email='fred@example.com')

    backend = max_backend.MAXBackend()
    backend.authenticate(Mock(), 'some-ticket', 'service-url')

    assert max_backend.logger.info.called
    assert 'success' in max_backend.logger.info.call_args[0][0]
    assert 'fred@example.com' in max_backend.logger.info.call_args[0]
