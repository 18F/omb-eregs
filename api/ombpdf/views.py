import json

from django.contrib.staticfiles.templatetags.staticfiles import static
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils.safestring import SafeString

from ombpdf import html, rawlayout, semhtml
from ombpdf.document import OMBDocument
from ombpdf.download_pdfs import ROOT_DIR as DATA_DIR
from ombpdf.util import get_ltpages


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


def index(request):
    return render(request, 'ombpdf/index.html', {
        'name': __name__,
        'pdfmap': get_pdfmap(),
    })


def as_path(pathname):
    pdfmap = get_pdfmap()
    if pathname in pdfmap:
        return pdfmap[pathname]
    raise Http404()


def raw_pdf(request, pdf):
    return FileResponse(as_path(pdf).open('rb'),
                        content_type='application/pdf')


def html_pdf(request, pdf):
    return HttpResponse(html.to_html(to_doc(as_path(pdf))),
                        content_type='text/html')


def rawlayout_pdf(request, pdf):
    doc = to_doc(as_path(pdf))

    script_params = {
        'pdfPath': reverse('raw_pdf', kwargs={'pdf': pdf}),
        'workerSrc': static('ombpdf/js/pdf.worker.bundle.js'),
    }

    html, ctx = rawlayout.to_html(doc)

    return render(request, 'ombpdf/rawlayout.html', {
        'doc': doc,
        'html': SafeString(html),
        'script_params': SafeString(json.dumps(script_params)),
        **ctx,
    })


def semhtml_pdf(request, pdf):
    return HttpResponse(semhtml.to_html(to_doc(as_path(pdf))),
                        content_type='text/html')


def prosemirror_fun(request):
    return render(request, 'ombpdf/prosemirror-fun.html')
