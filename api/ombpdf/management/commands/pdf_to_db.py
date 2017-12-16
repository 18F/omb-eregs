from argparse import FileType
from pathlib import Path

from django.core.management.base import BaseCommand

from document.models import DocNode
from ombpdf.document import OMBDocument
from ombpdf.semdb import to_db
from reqs.models import Policy


class Command(BaseCommand):
    help = 'Import a PDF into the database.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename', type=FileType('rb'))

    def handle(self, *args, **options):
        fp = options['filename']
        omb_policy_id = Path(fp.name).stem.upper()

        policy = Policy.objects.get(omb_policy_id=omb_policy_id)

        self.stdout.write(f'Deleting any current document for "{policy}".')
        DocNode.objects.filter(policy=policy).delete()

        doc = OMBDocument.from_file(fp)
        to_db(doc, policy)

        self.stdout.write(f'Imported document for "{policy}" into database.')
