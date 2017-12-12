from django.core.management.base import BaseCommand

import ombpdf.download_pdfs


class Command(BaseCommand):
    help = 'Download a bunch of OMB PDFs.'  # NOQA

    def handle(self, *args, **options):
        ombpdf.download_pdfs.main()
