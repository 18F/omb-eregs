import logging

from reversion.revisions import create_revision

logger = logging.getLogger(__name__)


def create_revisions_for(model):
    """Create a new revision for each instance of the requested model"""
    total = model.objects.count()
    for idx, obj in enumerate(model.objects.iterator()):
        idx = idx + 1   # 1-indexed
        with create_revision():
            obj.save()
        if idx % 100 == 0:
            logger.info('Created revision for %s: %s / %s', model, idx, total)
