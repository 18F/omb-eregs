from argparse import FileType

from django.core.management.base import BaseCommand

from ombpdf.document import OMBDocument
from ombpdf.semxml import to_xml


class Command(BaseCommand):
    help = 'Convert a PDF to XML.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename', type=FileType('rb'))

    def handle(self, *args, **options):
        doc = OMBDocument.from_file(options['filename'])
        self.stdout.write(to_xml(doc))
