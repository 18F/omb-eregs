from model_mommy import mommy

from document.tree import DocCursor
from reqs.models import Policy


def test_policy_edit_doc_button(admin_client):
    policy = mommy.make(Policy, slug='some-policy')
    root = DocCursor.new_tree('root', policy=policy)
    root.nested_set_renumber()

    result = admin_client.get(f'/admin/reqs/policy/{policy.pk}/change/')
    assert b'_savethendoc' in result.content
    assert b'Save and edit document' in result.content


def test_policy_redirect(admin_client):
    policy = mommy.make(Policy, slug='some-policy')
    root = DocCursor.new_tree('root', policy=policy)
    root.nested_set_renumber()

    result = admin_client.post(f'/admin/reqs/policy/{policy.pk}/change/', {
       'title': 'Some new policy title',
       'omb_policy_id': '',
       'issuance': policy.issuance.isoformat(),
       'sunset': '',
       'public': 'on',
       'workflow_phase': 'cleanup',
       '_savethendoc': 'Save and edit document',
    })

    assert result.status_code == 302
    assert result['Location'] == '/admin/document-editor/some-policy'

    policy.refresh_from_db()
    assert policy.title == 'Some new policy title'
