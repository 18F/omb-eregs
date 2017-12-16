from argparse import FileType

from django.core.management.base import BaseCommand

from ombpdf.document import OMBDocument
from ombpdf.semdb import to_db


class Command(BaseCommand):
    help = 'Import a PDF into the database.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename', type=FileType('rb'))

    def handle(self, *args, **options):
        doc = OMBDocument.from_file(options['filename'])
        to_db(doc)
        self.stdout.write('Imported into database.')
