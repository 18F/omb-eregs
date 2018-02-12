from io import BytesIO

import pytest
from model_mommy import mommy

from document.management.commands import import_xml_doc
from document.models import DocNode
from document.tree import DocCursor
from reqs.models import Policy, WorkflowPhases


@pytest.mark.django_db
def test_fetch_policy_pk():
    policy = mommy.make(Policy)
    assert import_xml_doc.fetch_policy(f"{policy.pk}") == policy


@pytest.mark.django_db
def test_fetch_policy_number():
    policy = mommy.make(Policy, omb_policy_id='M-12-13')
    assert import_xml_doc.fetch_policy('M-12-13') == policy


@pytest.mark.django_db
def test_import_xml_doc():
    policy = mommy.make(Policy, workflow_phase=WorkflowPhases.no_doc)
    for i in range(2):
        xml = BytesIO(f"""
        <aroot title="Root of Doc {i}\u2026">
            <subchild emblem="b">
                <content>Contents</content>
            </subchild>
            <subchild title="Second child">
                <content>Subchild 2 here</content>
                <subsubchild />
            </subchild>
        </aroot>
        """.strip().encode('utf-8'))

        root = import_xml_doc.import_xml_doc(policy, xml)
        assert DocNode.objects.count() == 4
        root_model = DocNode.objects.get(identifier='aroot_1')
        root = DocCursor.load_from_model(root_model)
        assert root.title == f'Root of Doc {i}\u2026'
        assert root['subchild_b'].text == 'Contents'
        assert root['subchild_b'].title == ''
        assert root['subchild_2'].title == 'Second child'
        assert root['subchild_2']['subsubchild_1'].node_type == 'subsubchild'

        policy.refresh_from_db()
        assert policy.workflow_phase == WorkflowPhases.published.name
