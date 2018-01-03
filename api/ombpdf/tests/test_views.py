import pytest

from ombpdf.download_pdfs import download

PDFPATH = '2016/m_16_19_1.pdf'


def setup_module(module):
    # Ensure we have at least one PDF for the webapp to process.
    download(PDFPATH)


@pytest.mark.urls('ombpdf.urls')
def test_index_works(client):
    assert PDFPATH.encode('ascii') in client.get('/').content


@pytest.mark.urls('ombpdf.urls')
def test_raw_pdf_works(client):
    assert client.get(f'/raw/{PDFPATH}').status_code == 200


@pytest.mark.urls('ombpdf.urls')
def test_html_pdf_works(client):
    assert client.get(f'/html/{PDFPATH}').status_code == 200


@pytest.mark.urls('ombpdf.urls')
def test_semhtml_pdf_works(client):
    assert client.get(f'/semhtml/{PDFPATH}').status_code == 200


@pytest.mark.urls('ombpdf.urls')
def test_rawlayout_works(client):
    assert client.get(f'/rawlayout/{PDFPATH}').status_code == 200
