from flask import Flask, render_template, Response, Markup, url_for
from werkzeug.routing import BaseConverter, ValidationError

from ombpdf.download_pdfs import ROOT_DIR as DATA_DIR
from ombpdf.document import OMBDocument
from ombpdf.util import get_ltpages
from ombpdf import html, semhtml, rawlayout


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


_ltpages_cache = {}

def to_doc(path):
    if path not in _ltpages_cache:
        with path.open('rb') as fp:
            _ltpages_cache[path] = get_ltpages(fp)
    return OMBDocument(
        _ltpages_cache[path],
        filename=path.relative_to(DATA_DIR),
    )


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


@app.route('/rawlayout/<pdfpath:pdf>')
def rawlayout_pdf(pdf):
    doc = to_doc(pdf)

    script_params = {
        'pdfPath': url_for('raw_pdf', pdf=pdf),
        'workerSrc': url_for('static', filename='js/pdf.worker.bundle.js'),
    }

    html, ctx = rawlayout.to_html(doc)

    return render_template(
        'rawlayout.html',
        doc=doc,
        html=Markup(html),
        script_params=script_params,
        **ctx,
    )
