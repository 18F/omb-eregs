import logging
from os.path import basename
from typing import List, Optional, Set, Tuple

import requests
import reversion
from django.core.management.base import BaseCommand
from requests.exceptions import RequestException

from ombpdf.management.commands.scrape_memoranda import Url, parse_pdf
from reqs.models import Policy, WorkflowPhases

OLD_DOMAIN = 'www.whitehouse.gov'
NEW_DOMAIN = 'obamawhitehouse.archives.gov'
PROBLEM_PDFS = (
    'BILLS-103s1587enr.pdf',
    'a11_2016.pdf',
    'a136_revised_2014.pdf',
    'hr_5005_enr.pdf',
)
logger = logging.getLogger(__name__)


def best_url(urls: List[Url]) -> Optional[Url]:
    """Try hitting the requested url; if it fails, fall back to an
    alternate."""
    for url in urls:
        if basename(url) in PROBLEM_PDFS:
            continue
        try:
            response = requests.head(url)
            if response.status_code == 200:
                return url
        except RequestException:
            continue
    return None


def import_from_policy(policy: Policy) -> bool:
    """Convert a policy to a list of potential urls to try, pick the first
    that works, then attempt to parse. Return whether or not the whole process
    was successful."""
    uri = policy.uri.strip()
    urls_to_try = [Url(uri)]
    if OLD_DOMAIN in uri:
        urls_to_try.append(Url(uri.replace(OLD_DOMAIN, NEW_DOMAIN)))
    if policy.document_source:
        urls_to_try.insert(0, Url(policy.document_source.url))

    url = best_url(urls_to_try)
    return bool(url and parse_pdf(policy, url))


def import_pdfs_from_policies() -> Tuple[Set[str], Set[str]]:
    """Attempt to import document text from all pdf policies which haven't
    already been imported."""
    successes, failures = set(), set()
    query = Policy.objects.annotate_with_has_docnodes() \
        .filter(uri__endswith='.pdf',
                has_docnodes=False)  # not replacing data
    for policy in query:
        ident = f"{policy.pk}: {policy.title_with_number}"
        with reversion.create_revision():
            if import_from_policy(policy):
                policy.workflow_phase = WorkflowPhases.cleanup.name
                successes.add(ident)
            else:
                policy.workflow_phase = WorkflowPhases.failed.name
                failures.add(ident)
            policy.save()
    return successes, failures


class Command(BaseCommand):
    help = import_pdfs_from_policies.__doc__    # noqa

    def handle(self, *args, **options):
        successes, failures = import_pdfs_from_policies()
        num_success, num_failure = len(successes), len(failures)
        logger.info('Imported %s new documents. Attempted %s, with %s '
                    'failures: %s', num_success, num_success + num_failure,
                    num_failure, list(sorted(failures)))
