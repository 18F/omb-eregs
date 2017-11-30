from flask import Flask, render_template, Response
from werkzeug.routing import BaseConverter, ValidationError

from ombpdf.download_pdfs import ROOT_DIR as DATA_DIR
from ombpdf.document import OMBDocument
from ombpdf import html, semhtml


class PdfPathConverter(BaseConverter):
    def __init__(self, url_map):
        super().__init__(url_map)
        self.regex = r'[0-9A-Za-z\/_\-]+\.pdf'

    def to_python(self, value):
        pdfmap = get_pdfmap()
        if value in pdfmap:
            return pdfmap[value]
        raise ValidationError()

    def to_url(self, value):
        return to_urlpath(value)


app = Flask(__name__)
app.url_map.converters['pdfpath'] = PdfPathConverter


def to_urlpath(path):
    return '/'.join(path.relative_to(DATA_DIR).parts)


def get_pdfmap():
    pdfmap = {}
    for path in DATA_DIR.glob('**/*.pdf'):
        pdfmap[to_urlpath(path)] = path
    return pdfmap


def to_doc(path):
    return OMBDocument.from_file(path.open('rb'))


@app.route('/')
def index():
    return render_template(
        'index.html',
        name=__name__,
        pdfmap=get_pdfmap(),
    )


@app.route('/raw/<pdfpath:pdf>')
def raw_pdf(pdf):
    return Response(pdf.read_bytes(), mimetype='application/pdf')


@app.route('/html/<pdfpath:pdf>')
def html_pdf(pdf):
    return html.to_html(to_doc(pdf))


@app.route('/semhtml/<pdfpath:pdf>')
def semhtml_pdf(pdf):
    return semhtml.to_html(to_doc(pdf))
