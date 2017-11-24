from collections import namedtuple

from pdfminer import layout

from . import fontsize
from . import util


class OMBDocument:
    def __init__(self, ltpages):
        stats = fontsize.get_font_size_stats(ltpages)
        self.paragraph_fontsize = stats.most_common(1)[0][0]
        self.pages = [OMBPage(page) for page in ltpages]

    @property
    def lines(self):
        for page in self.pages:
            for line in page:
                yield line

    @classmethod
    def from_file(cls, fp):
        return cls(util.get_ltpages(fp))


class OMBPage(list):
    def __init__(self, ltpage):
        super().__init__([
            OMBTextLine(line)
            for line in util.iter_flattened_layout(
                ltpage,
                layout.LTTextLineHorizontal)
        ])
        self.ltpage = ltpage


OMBFootnoteCitation = namedtuple('OMBFootnoteCitation', ['number',
                                                         'preceding_text'])

OMBFootnote = namedtuple('OMBFootnote', ['number', 'text'])


class AnnotatableMixin:
    def set_annotation(self, annotation):
        if self.annotation is not None:
            raise AssertionError(f"Document item already has annotation")
        self.annotation = annotation


class OMBTextCharacter(str, AnnotatableMixin):
    def __new__(cls, ltchar):
        obj = str.__new__(cls, ltchar.get_text())
        obj.ltchar = ltchar
        obj.fontsize = fontsize.FontSize.from_ltchar(ltchar)
        obj.annotation = None
        return obj


class OMBTextLine(list, AnnotatableMixin):
    def __init__(self, lttextline):
        super().__init__([
            OMBTextCharacter(ltchar) for ltchar
            in util.iter_flattened_layout(lttextline, layout.LTChar)
        ])
        self.lttextline = lttextline
        self.annotation = None

    def __str__(self):
        return ''.join([char for char in self])
