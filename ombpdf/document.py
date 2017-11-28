from collections import namedtuple
from decimal import Decimal
import math

from pdfminer import layout

from . import fontsize
from . import util
from .annotators import AnnotatorTracker


class OMBDocument:
    def __init__(self, ltpages, filename=None):
        stats = fontsize.get_font_size_stats(ltpages)
        self.paragraph_fontsize = stats.most_common(1)[0][0]
        self.pages = [
            OMBPage(page, number)
            for page, number in zip(ltpages, range(1, len(ltpages) + 1))
        ]
        self.filename = filename
        self.left_edge = min(self.lines, key=lambda l: l.left_edge).left_edge
        self.annotators = AnnotatorTracker(self)

    @property
    def lines(self):
        for page in self.pages:
            for line in page:
                yield line

    @classmethod
    def from_file(cls, fp):
        return cls(util.get_ltpages(fp), filename=fp.name)


class OMBPage(list):
    def __init__(self, ltpage, number):
        super().__init__([
            OMBTextLine(line)
            for line in util.iter_flattened_layout(
                ltpage,
                layout.LTTextLineHorizontal)
        ])
        self.ltpage = ltpage
        self.number = number


OMBFootnoteCitation = namedtuple('OMBFootnoteCitation', ['number',
                                                         'preceding_text'])

OMBFootnote = namedtuple('OMBFootnote', ['number', 'text'])

OMBPageNumber = namedtuple('OMBPageNumber', ['number'])

OMBParagraph = namedtuple('OMBParagraph', ['id'])

OMBListItem = namedtuple('OMBListItem', ['list_id', 'number', 'is_ordered',
                                         'indentation'])

OMBListItemMarker = namedtuple('OMBListItemMarker', ['is_ordered'])


class AnnotatableMixin:
    def set_annotation(self, annotation):
        if self.annotation is not None and self.annotation != annotation:
            raise AssertionError(f"Document item already has a different "
                                 f"annotation")
        self.annotation = annotation


class OMBTextCharacter(AnnotatableMixin):
    def __init__(self, ltchar):
        self.char = ltchar.get_text()
        self.ltchar = ltchar
        self.fontsize = fontsize.FontSize.from_ltchar(ltchar)
        self.annotation = None
        self.is_underlined = False

    def __str__(self):
        return self.char

    def set_underlined(self):
        self.is_underlined = True

    def is_like(self, char):
        """
        Returns whether the character has the same style and annotation
        as another character. The other character may represent a different
        actual character, however, e.g. while we may represent a 'g', the
        other may represent an 'e'.
        """

        return (
            self.is_underlined == char.is_underlined and
            self.annotation == char.annotation and
            self.fontsize == char.fontsize
        )

class OMBTextLine(list, AnnotatableMixin):
    def __init__(self, lttextline):
        super().__init__([
            OMBTextCharacter(ltchar) for ltchar
            in util.iter_flattened_layout(lttextline, layout.LTChar)
        ])
        self.lttextline = lttextline
        self.annotation = None

        # There can be *really* close bounding boxes, so we're
        # just going to round to the nearest tenth.
        self.left_edge = Decimal(lttextline.x0).quantize(Decimal('.1'))

    def iter_char_chunks(self):
        """
        Iterate over all "chunks" of characters that share the same
        fundamental style/annotation. Yields (char, text) tuples, where
        'char' is the first OMBTextCharacter of the chunk and 'text' is
        the string representation of the chunk.
        """

        curr_style = None
        chars = []
        i = 0

        def make_item():
            return (curr_style, ''.join([str(c) for c in chars]))

        for item in self.lttextline:
            if isinstance(item, layout.LTAnno):
                chars.append(item.get_text())

            if not isinstance(item, layout.LTChar):
                continue

            char = self[i]
            if curr_style is None:
                curr_style = char
            if char.is_like(curr_style):
                chars.append(char)
            else:
                yield make_item()
                chars = [char]
                curr_style = char
            i += 1
        if chars:
            yield make_item()

    def iter_match(self, match, group=0):
        for char in self[match.start(group):match.end(group)]:
            yield char

    def __str__(self):
        return ''.join([str(char) for char in self])

    def __repr__(self):
        return f'<{self.__class__.__name__} with text "{str(self)}">'

    def is_blank(self):
        return len(str(self).strip()) == 0
