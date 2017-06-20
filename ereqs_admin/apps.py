import logging

from django.apps import AppConfig
from django.db.models.signals import m2m_changed, post_migrate, post_save

from ereqs_admin.revision_creation import create_versions_after_migration

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


def adminlog_post_save(sender, instance, **kwargs):
    """Django's admin already logs when edits are made. Pass that along to our
    logging system."""
    # Can't load these at the top as this module is loaded before the apps are
    # completely loaded
    from django.contrib.admin.models import ADDITION, CHANGE, DELETION  # noqa
    if instance.action_flag == ADDITION:
        logger.info("%s created %s '%s'", instance.user.username,
                    instance.content_type, instance.object_repr)
    elif instance.action_flag == DELETION:
        logger.info("%s deleted %s '%s'", instance.user.username,
                    instance.content_type, instance.object_repr)
    elif instance.action_flag == CHANGE:
        logger.info("%s changed %s %s: '%s'", instance.user.username,
                    instance.content_type, instance.object_repr,
                    instance.get_change_message())


def log_m2m_change(sender, instance, action, reverse, model, pk_set, **kwargs):
    """Log changes for many-to-many fields, notably around permissions and
    groups"""
    model_name = model._meta.verbose_name_plural
    instance_model = instance._meta.verbose_name
    if action == 'post_add':
        objects_added = list(model.objects.filter(pk__in=pk_set))
        logger.info("%s given to %s '%s': %s", model_name, instance_model,
                    instance, objects_added)
    elif action == 'post_remove':
        objects_added = list(model.objects.filter(pk__in=pk_set))
        logger.info("%s removed from %s '%s': %s", model_name, instance_model,
                    instance, objects_added)
    elif action == 'post_clear':
        logger.info("All %s removed from %s '%s'", model_name, instance_model,
                    instance)


class EreqsAdminConfig(AppConfig):
    name = 'ereqs_admin'

    def ready(self):
        from django.contrib.auth.models import Group, User     # noqa
        post_migrate.connect(create_editors, sender=self)
        post_migrate.connect(create_versions_after_migration, sender=self)
        post_save.connect(adminlog_post_save, sender='admin.LogEntry')
        m2m_changed.connect(log_m2m_change, sender=User.groups.through)
        m2m_changed.connect(log_m2m_change,
                            sender=User.user_permissions.through)
        m2m_changed.connect(log_m2m_change, sender=Group.permissions.through)
