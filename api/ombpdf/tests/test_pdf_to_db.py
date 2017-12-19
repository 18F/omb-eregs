import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from model_mommy import mommy

from ombpdf.download_pdfs import download
from reqs.models import Policy

pdf_path = None


def setup_module():
    global pdf_path
    pdf_path = download('2014/m-14-10.pdf')


@pytest.mark.django_db
def test_error_raised_if_policy_does_not_exist():
    with pytest.raises(CommandError, message="Policy 'M-14-10' not found."):
        call_command('pdf_to_db', str(pdf_path))


@pytest.mark.django_db
def test_it_works():
    policy = mommy.make(Policy, omb_policy_id='M-14-10')
    assert len(policy.docnode_set.all()) == 0

    call_command('pdf_to_db', str(pdf_path))

    policy.refresh_from_db()
    assert len(policy.docnode_set.all()) > 0
