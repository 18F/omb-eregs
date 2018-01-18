import pathlib

import pytest
import requests
from django.contrib.auth.models import User
from model_mommy import mommy

from reqs.models import Policy, WorkflowPhases


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


def test_pdf_upload(admin_client):
    policy = mommy.make(Policy, title='First Policy',
                        uri='http://example.com/oge-450-a.pdf')
    policy_url = '/admin/reqs/policy/{0}/change/'.format(policy.id)
    form = admin_client.get(policy_url)
    form_text = form.content.decode('utf-8')
    assert 'id_document_source' in form_text
    assert 'First Policy' in form_text
    assert not policy.document_source
    data = {
        'policy_number': policy.policy_number,
        'title': 'First Policy Edited',
        'slug': 'first-policy-edited',
        'uri': policy.uri,
        'omb_policy_id': policy.omb_policy_id,
        'policy_type': policy.policy_type,
        'issuance': policy.issuance,
        'issuing_body': policy.issuing_body,
        'sunset': '2015-01-01',
        'policy_status': policy.policy_status,
        'workflow_phase': WorkflowPhases.no_doc.name,
    }
    pdf_path = '{0}/oge-450-a.pdf'.format(pathlib.Path(__file__).parent)
    with open(pdf_path, 'rb') as f:
        data['document_source'] = f
        posted = admin_client.post(policy_url, data)

    # Successful no-error POSTs will return 302s:
    assert posted.status_code == 302

    updated_form = admin_client.get(policy_url)
    updated_text = updated_form.content.decode('utf-8')
    assert 'First Policy Edited' in updated_text
    assert 'oge-450-a.pdf' in updated_text
    updated_policy = Policy.objects.get(id=policy.id)
    assert updated_policy.document_source
    pdf = requests.get(updated_policy.document_source.url)
    assert pdf.status_code == 200
    with open(pdf_path, 'rb') as f:
        assert pdf.content == f.read()


def test_not_pdf_upload(admin_client):
    policy = mommy.make(Policy, title='First Policy')
    policy_url = '/admin/reqs/policy/{0}/change/'.format(policy.id)
    form = admin_client.get(policy_url)
    form_text = form.content.decode('utf-8')
    assert 'id_document_source' in form_text
    assert 'First Policy' in form_text
    assert not policy.document_source
    data = {
        'policy_number': policy.policy_number,
        'title': 'First Policy Edited',
        'uri': policy.uri,
        'omb_policy_id': policy.omb_policy_id,
        'policy_type': policy.policy_type,
        'issuance': policy.issuance,
        'issuing_body': policy.issuing_body,
        'sunset': '2015-01-01',
        'policy_status': policy.policy_status,
        'workflow_phase': WorkflowPhases.no_doc.name,
    }
    not_pdf_path = '{0}/not-a-pdf.txt'.format(pathlib.Path(__file__).parent)
    with open(not_pdf_path, 'rb') as f:
        data['document_source'] = f
        resp = admin_client.post(policy_url, data)
    # POSTs with errors will return 200s:
    assert resp.status_code == 200
    resp_text = resp.content.decode('utf-8')
    assert 'The file must be a PDF.' in resp_text
    updated_policy = Policy.objects.get(id=policy.id)
    assert updated_policy.title == 'First Policy'
    assert not policy.document_source
