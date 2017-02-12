import logging
import os

import requests
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)
CSV_URL = ("https://github.com/ombegov/policy-v2/raw/master/assets/"
           "Phase1_CombinedQA_AllPhase1_Nov21.csv")
FILENAME = 'data.csv'


class Command(BaseCommand):
    help = "Fetch CSV data from OMB's GitHub"   # noqa

    def handle(self, *args, **options):
        if not os.path.isfile(FILENAME):
            response = requests.get(CSV_URL).content
            response_str = response.decode('cp1252')
            with open(FILENAME, 'w') as data_csv:
                data_csv.write(response_str)
        else:
            logger.warning("%s already exists, skipping.", FILENAME)
