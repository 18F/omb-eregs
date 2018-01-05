import logging
import re
from os.path import basename
from typing import Dict, NewType, Set, Tuple
from urllib.parse import urljoin, urlparse

import requests
from django.core.management.base import BaseCommand
from django.db.models import Exists, OuterRef
from lxml import etree

from document.models import DocNode
from ombpdf.document import OMBDocument
from ombpdf.download_pdfs import download_with_progress
from ombpdf.semdb import to_db
from reqs.models import Policy

MemoId = NewType('MemoId', str)
Url = NewType('Url', str)

BASE_URL = 'https://www.whitehouse.gov/omb/memoranda/'
M_REGEX = re.compile('^(?P<m_number>M-\d\d-\d\d), .*')
known_exceptions = ()  # no known failure cases
logger = logging.getLogger(__name__)


def scrape_urls(base_url=BASE_URL) -> Dict[MemoId, Url]:
    """Hit OMB's listing of memoranda, pull out each memo and url pair, then
    de-dupe."""
    html = etree.HTML(requests.get(base_url).content)
    url_by_num = {}
    for link in html.findall('.//li/a[@href]'):
        match = M_REGEX.match(link.text or '')
        if match and link.attrib['href'].endswith('.pdf'):
            url_by_num[match.group('m_number')] = urljoin(
                base_url, link.attrib['href'])
    return url_by_num


def parse_pdf(policy: Policy, url: Url) -> bool:
    """Fetch and attempt to parse a PDF. Return whether or not this was
    successful."""
    try:
        pdf = download_with_progress(url)
        pdf.name = basename(urlparse(url).path)     # this used by from_file
        doc = OMBDocument.from_file(pdf)
        cursor = to_db(doc, policy)
        logger.info('Imported %s (%s nodes)', policy.omb_policy_id,
                    cursor.subtree_size())
        return True
    except known_exceptions:
        logger.warning('Something went wrong when importing %s',
                       policy.omb_policy_id)
        return False


def scrape_memoranda() -> Tuple[Set[MemoId], Set[MemoId]]:
    """For all policies which haven't already been imported, try parsing the
    pdf listed on OMB's site."""
    successes, failures = set(), set()
    url_by_num = scrape_urls()
    has_docnodes = Exists(DocNode.objects.filter(policy=OuterRef('pk')))
    query = Policy.objects \
        .annotate(has_docnodes=has_docnodes) \
        .filter(omb_policy_id__in=url_by_num.keys()) \
        .filter(has_docnodes=False)     # not replacing data
    for policy in query:
        if parse_pdf(policy, url_by_num[policy.omb_policy_id]):
            successes.add(policy.omb_policy_id)
        else:
            failures.add(policy.omb_policy_id)
    return successes, failures


class Command(BaseCommand):
    help = scrape_memoranda.__doc__     # noqa

    def handle(self, *args, **options):
        successes, failures = scrape_memoranda()
        num_success, num_failure = len(successes), len(failures)
        logger.info('Imported %s new documents. Attempted %s, with %s '
                    'failures: %s', num_success, num_success + num_failure,
                    num_failure, list(sorted(failures)))
