from argparse import FileType
from pathlib import Path

import reversion
from django.core.management.base import BaseCommand, CommandError

from document.management.commands.import_xml_doc import fetch_policy
from document.models import DocNode
from ombpdf.document import OMBDocument
from ombpdf.semdb import to_db
from reqs.models import WorkflowPhases


class Command(BaseCommand):
    help = 'Import a PDF into the database.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename', type=FileType('rb'))
        parser.add_argument('--policy',
                            help='Policy id or number to associate')

    def handle(self, *args, **options):
        fp = options['filename']

        policy_name = options['policy'] or Path(fp.name).stem.upper()
        policy = fetch_policy(policy_name)

        with reversion.create_revision():
            if policy is None:
                raise CommandError(f"Policy '{policy_name}' not found.")
                policy.workflow_phase = WorkflowPhases.failed.name
            else:
                policy.workflow_phase = WorkflowPhases.cleanup.name
            policy.save()

        self.stdout.write(f'Deleting any current document for "{policy}".')
        DocNode.objects.filter(policy=policy).delete()

        doc = OMBDocument.from_file(fp)
        to_db(doc, policy)

        self.stdout.write(f'Imported document for "{policy}" into database.')
