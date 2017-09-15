from unittest.mock import Mock, call

import pytest

from ereqs_admin import revision_creation


def test_reversion_models_active_only(monkeypatch):
    monkeypatch.setattr(revision_creation, 'apps', Mock())
    monkeypatch.setattr(revision_creation, 'reversion', Mock())
    revision_creation.reversion.is_registered.return_value = True

    def mock_get_model(app_label, model_name):
        if app_label == 'valid':
            return Mock(model_name=model_name)
        else:
            raise LookupError("bad data")

    revision_creation.apps.get_model = mock_get_model
    results = revision_creation.reversion_models([
        ('valid', 'first'), ('invalid', 'second'), ('valid', 'third')])
    assert [r.model_name for r in results] == ['first', 'third']


def test_reversion_models_must_be_registered(monkeypatch):
    monkeypatch.setattr(revision_creation, 'apps', Mock())
    monkeypatch.setattr(revision_creation, 'reversion', Mock())
    registered1, unregistered, registered2 = Mock(), Mock(), Mock()
    revision_creation.apps.get_model.side_effect = [
        registered1, unregistered, registered2]

    def mock_is_registered(model):
        return model in (registered1, registered2)

    revision_creation.reversion.is_registered = mock_is_registered
    model_pairs = [('a', 'b'), ('c', 'd'), ('e', 'f')]
    assert list(revision_creation.reversion_models(model_pairs)) == [
        registered1, registered2]


@pytest.mark.django_db
def test_create_versions_after_migration_no_plan(monkeypatch):
    monkeypatch.setattr(revision_creation, 'create_revisions_for', Mock())
    revision_creation.create_revisions_for.side_effect = ValueError

    revision_creation.create_versions_after_migration()
    revision_creation.create_versions_after_migration(plan=[])


@pytest.mark.django_db
def test_create_versions_after_migration(monkeypatch):
    monkeypatch.setattr(revision_creation, 'reversion_models', Mock())
    monkeypatch.setattr(revision_creation, 'create_revisions_for', Mock())
    model1, model2, model3 = Mock(), Mock(), Mock()
    revision_creation.reversion_models.return_value = [model1, model2, model3]

    revision_creation.create_versions_after_migration(plan=[
        (Mock(spec_set=[]), False),    # no REVISED_MODELS
        (Mock(REVISED_MODELS=[('a', 'b'), ('c', 'd')]), False),
        (Mock(REVISED_MODELS=[('c', 'd'), ('e', 'f')]), False),
        (Mock(REVISED_MODELS=[('g', 'h')]), True),  # rollback
    ])

    assert revision_creation.reversion_models.call_args == call({
        ('a', 'b'), ('c', 'd'), ('e', 'f')})
    assert revision_creation.create_revisions_for.call_args_list == [
        call(model1), call(model2), call(model3)]
