from cfenv import AppEnv
from django.core import management
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Only migrate the database once'     # noqa

    def handle(self, *args, **options):
        env = AppEnv()
        if env.index is None or env.index == 0:
            management.call_command('migrate', '--noinput')
