import importlib
from collections import OrderedDict

ANNOTATORS = OrderedDict([
    ('page_numbers', 'ombpdf.pagenumbers.annotate_page_numbers'),
    ('footnotes', 'ombpdf.footnotes.annotate_footnotes'),
    ('footnote_citations', 'ombpdf.footnotes.annotate_citations'),
    ('underlines', 'ombpdf.underlines.set_underlines'),
    ('lists', 'ombpdf.lists.annotate_lists'),
    ('headings', 'ombpdf.headings.annotate_headings'),
    ('paragraphs', 'ombpdf.paragraphs.annotate_paragraphs'),
])

_annotator_funcs = {}


def _validate_name(name):
    if name not in ANNOTATORS:
        raise ValueError(f'Invalid annotator: {name}')


def get(name):
    _validate_name(name)
    if name not in _annotator_funcs:
        modname, funcname = ANNOTATORS[name].rsplit('.', 1)
        mod = importlib.import_module(modname)
        func = getattr(mod, funcname)
        _annotator_funcs[name] = func
    return _annotator_funcs[name]


class AnnotatorTracker:
    def __init__(self, doc):
        self._doc = doc
        self._has_run = {}
        for name in ANNOTATORS:
            self._has_run[name] = False

    def require_all(self):
        self.require(*ANNOTATORS)

    def require(self, *names):
        for name in names:
            _validate_name(name)
            if not self._has_run[name]:
                func = get(name)
                func(self._doc)
                self._has_run[name] = True
