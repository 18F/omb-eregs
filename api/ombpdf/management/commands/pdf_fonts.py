from django.core.management.base import BaseCommand

import ombpdf.fontsize
import ombpdf.util


class Command(BaseCommand):
    help = 'Show font usage statistics for a PDF.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename')

    def get_ltpages(self, filename):
        with open(filename, 'rb') as infile:
            return ombpdf.util.get_ltpages(infile)

    def handle(self, *args, **options):
        filename = options['filename']
        ombpdf.fontsize.main(self.get_ltpages(filename))
