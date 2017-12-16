from argparse import FileType
from datetime import date
from pathlib import Path

from django.core.management.base import BaseCommand

from ombpdf.document import OMBDocument
from ombpdf.semdb import to_db
from reqs.models import Policy, PolicyTypes


class Command(BaseCommand):
    help = 'Import a PDF into the database.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename', type=FileType('rb'))

    def handle(self, *args, **options):
        fp = options['filename']
        omb_policy_id = Path(fp.name).stem.upper()
        policy_number = 2000  # TODO: Um, how do we actually get this?

        self.stdout.write(f'Deleting policy {policy_number} if it exists...')
        Policy.objects.filter(policy_number=policy_number).delete()

        self.stdout.write(f'Creating policy.')
        policy = Policy(
            issuance=date(2001, 2, 3),
            omb_policy_id=omb_policy_id,
            policy_number=policy_number,
            policy_type=PolicyTypes.memorandum.name,
            policy_status='Active',
            title=f'TODO: Insert title for OMB Policy {omb_policy_id} here',
            uri=f'http://example.com/TODO/link/to/pdf/for/{omb_policy_id}',
        )
        policy.save()

        doc = OMBDocument.from_file(fp)
        to_db(doc, policy)

        self.stdout.write(f'Imported {omb_policy_id} into database.')
