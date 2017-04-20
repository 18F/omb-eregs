import logging

from django.apps import AppConfig
from django.db.models.signals import post_migrate

logger = logging.getLogger(__name__)


def create_editors(**kwargs):
    # Can't load these at the top as this module is loaded before the apps are
    # completely loaded
    from django.contrib.auth.models import Group, Permission    # noqa
    if not Group.objects.filter(name='Editors').exists():
        logger.info('No Editors group; creating')
        group = Group.objects.create(name='Editors')
        group.permissions = Permission.objects.filter(
            content_type__app_label='reqs')


class EreqsAdminConfig(AppConfig):
    name = 'ereqs_admin'

    def ready(self):
        post_migrate.connect(create_editors, sender=self)
