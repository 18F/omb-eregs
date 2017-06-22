from django.db import transaction
from reversion.management.commands import BaseRevisionCommand

from ereqs_admin.revision_creation import create_revisions_for


class Command(BaseRevisionCommand):
    help = "Creates revision for a given app [and model]."""    # noqa

    def add_arguments(self, parser):
        parser.add_argument(
            'app_label',
            metavar='app_label',
            nargs='*',
            help="Optional app_label or app_label.model_name list.",
        )

    def handle(self, *app_labels, **options):
        with transaction.atomic():
            for model in self.get_models(options):
                create_revisions_for(model)
