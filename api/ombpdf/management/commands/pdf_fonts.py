from argparse import FileType

from django.core.management.base import BaseCommand

import ombpdf.fontsize
import ombpdf.util


class Command(BaseCommand):
    help = 'Show font usage statistics for a PDF.'  # NOQA

    def add_arguments(self, parser):
        parser.add_argument('filename', type=FileType('rb'))

    def handle(self, *args, **options):
        ombpdf.fontsize.main(ombpdf.util.get_ltpages(options['filename']))
