import pytest
from django.contrib.auth.models import User
from model_mommy import mommy


@pytest.mark.urls('ereqs_admin.tests.both_user_forms_urls')
def test_user_create_notmax(admin_client):
    resp = admin_client.get('/django_user_form/add/').content.decode('utf-8')
    assert 'Password' in resp
    assert 'Password confirmation' in resp

    admin_client.post('/django_user_form/add/', {
        'username': 'newuser',
        'password1': 's3cr3ts3cr3t',
        'password2': 's3cr3ts3cr3t',
    })

    user = User.objects.get(username='newuser')
    assert user.check_password('s3cr3ts3cr3t')


def user_change_post(user, **kwargs):
    """Convert a user into a dictionary that might be used in the User edit
    form"""
    form = {
        'first_name': user.username,
        'username': user.username,
        'last_name': user.last_name,
        'email': user.email,
        'date_joined_0': '2017-01-01',
        'date_joined_1': '01:01:01',
        'initial-date_joined_0': '2017-01-01',
        'initial-date_joined_1': '01:01:01',
        '_save': 'Save',
    }
    form.update(kwargs)
    return form


@pytest.mark.urls('ereqs_admin.tests.both_user_forms_urls')
def test_user_edit_notmax(admin_client):
    user = mommy.make(User, first_name='pretest')
    resp = admin_client.get('/django_user_form/{0}/change/'.format(user.pk))
    resp_text = resp.content.decode('utf-8')
    assert 'Password' in resp_text
    assert 'Staff status' in resp_text

    admin_client.post('/django_user_form/{0}/change/'.format(user.pk),
                      user_change_post(user, first_name='posttest'))

    user.refresh_from_db()
    assert user.first_name == 'posttest'


@pytest.mark.urls('ereqs_admin.tests.both_user_forms_urls')
def test_user_create_max(admin_client):
    resp = admin_client.get('/max_user_form/add/').content.decode('utf-8')
    assert 'Password' not in resp
    assert 'Password confirmation' not in resp

    admin_client.post('/max_user_form/add/', {'username': 'newuser'})

    user = User.objects.get(username='newuser')
    assert not user.check_password('s3cr3ts3cr3t')
    assert user.is_staff


@pytest.mark.urls('ereqs_admin.tests.both_user_forms_urls')
def test_user_edit_max(admin_client):
    user = mommy.make(User, first_name='pretest')
    resp = admin_client.get('/max_user_form/{0}/change/'.format(user.pk))
    resp_text = resp.content.decode('utf-8')
    assert 'Password' not in resp_text
    assert 'Staff status' not in resp_text

    admin_client.post('/django_user_form/{0}/change/'.format(user.pk),
                      user_change_post(user, first_name='posttest'))

    user.refresh_from_db()
    assert user.first_name == 'posttest'
