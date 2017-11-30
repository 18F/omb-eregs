import pytest

from ombpdf.download_pdfs import download
import ombpdf.webapp


PDFPATH = '2016/m_16_19_1.pdf'


@pytest.fixture
def webapp():
    # Ensure we have at least one PDF for the webapp to process.
    download(PDFPATH)

    ombpdf.webapp.app.testing = True
    return ombpdf.webapp.app.test_client()


def test_index_works(webapp):
    assert PDFPATH.encode('ascii') in webapp.get('/').data


def test_raw_pdf_works(webapp):
    assert webapp.get(f'/raw/{PDFPATH}').status_code == 200


def test_html_pdf_works(webapp):
    assert webapp.get(f'/html/{PDFPATH}').status_code == 200


def test_semhtml_pdf_works(webapp):
    assert webapp.get(f'/semhtml/{PDFPATH}').status_code == 200
