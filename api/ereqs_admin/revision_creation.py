import logging
from typing import Any, Set  # noqa

import reversion
from django.apps import apps
from django.db import transaction
from reversion.revisions import create_revision

logger = logging.getLogger(__name__)


def create_revisions_for(model):
    """Create a new revision for each instance of the requested model"""
    total = model.objects.count()
    for idx, obj in enumerate(model.objects.iterator()):
        with create_revision():
            obj.save()
        if idx % 100 == 0:
            logger.info('Created revision for %s: %s / %s',
                        model._meta.verbose_name, idx + 1, total)


def reversion_models(model_pairs):
    """Given a sequence of (app_label, model_name) pairs, determine which are
    still Django models and registered with reversions"""
    for app_label, model_name in model_pairs:
        try:
            model = apps.get_model(app_label, model_name)
            if reversion.is_registered(model):
                yield model
            else:
                logger.warn("Model not registered with reversions %s %s",
                            app_label, model_name)
        except LookupError:
            logger.warn("Couldn't find model %s %s", app_label, model_name)


def create_versions_after_migration(**kwargs):
    """A post_migrate signal handler which creates revisions for models listed
    in appropriately annotated migrations."""
    migrations = [migration
                  for migration, rollback in kwargs.get('plan', [])
                  if not rollback]
    models: Set[Any] = set()
    for migration in migrations:
        models.update(getattr(migration, 'REVISED_MODELS', []))

    with transaction.atomic():
        for model in reversion_models(models):
            create_revisions_for(model)
