import logging
from collections import Counter
from decimal import Decimal

from pdfminer import layout

from . import fontsize, util
from .annotators import AnnotatorTracker
from .eqnamedtuple import eqnamedtuple

logger = logging.getLogger(__name__)


class OMBDocument:
    # Minimum percentage of lines, out of all lines in the document, that
    # we should expect to be on the left edge of the page. This helps us
    # filter out outliers that might be left of the edge, but which might
    # represent e.g. decorative banner text.
    MIN_LEFT_EDGE_PERCENTAGE = 0.10

    def __init__(self, ltpages, filename=None):
        stats = fontsize.get_font_size_stats(ltpages)
        self.paragraph_fontsize = stats.most_common(1)[0][0]
        self.pages = [
            OMBPage(page, number)
            for page, number in zip(ltpages, range(1, len(ltpages) + 1))
        ]
        self.filename = filename
        self.left_edge = self._calc_left_edge()
        self.annotators = AnnotatorTracker(self)

        self._realign_lines_left_of_left_edge()

    def _realign_lines_left_of_left_edge(self):
        for page in self.pages:
            lines = [line for line in page if line.left_edge < self.left_edge]
            for line in lines:
                line.left_edge = self.left_edge

    def _calc_left_edge(self):
        counter = Counter()
        total_lines = 0
        for line in self.lines:
            counter[line.left_edge] += 1
            total_lines += 1
        significant_edges = [
            left_edge for (left_edge, count) in counter.items()
            if count > total_lines * self.MIN_LEFT_EDGE_PERCENTAGE
        ]
        return min(significant_edges)

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


OMBFootnoteCitation = eqnamedtuple('OMBFootnoteCitation', ['number',
                                                           'preceding_text'])

OMBFootnote = eqnamedtuple('OMBFootnote', ['number', 'text'])

OMBFootnoteMarker = eqnamedtuple('OMBFootnoteMarker', ['number'])

OMBPageNumber = eqnamedtuple('OMBPageNumber', ['number'])

OMBParagraph = eqnamedtuple('OMBParagraph', ['id'])

OMBListItem = eqnamedtuple('OMBListItem', ['list_id', 'number', 'is_ordered',
                                           'indentation'])

OMBListItemMarker = eqnamedtuple('OMBListItemMarker', ['is_ordered'])

OMBHeading = eqnamedtuple('OMBHeading', ['level'])


class AnnotatableMixin:
    def set_annotation(self, annotation):
        if self.annotation is not None and self.annotation != annotation:
            logger.warn(
                f"Replacing {self.annotation} with {annotation}."
            )
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
    # Distance one edge can be from another to be considered more or less
    # the same.
    EDGE_THRESHOLD = Decimal('4')

    def __init__(self, lttextline):
        super().__init__([
            OMBTextCharacter(ltchar) for ltchar
            in util.iter_flattened_layout(lttextline, layout.LTChar)
        ])
        self.lttextline = lttextline
        self.annotation = None

        # We're interested in the left edge of the line for inferring
        # the *semantics* of the layout, rather than the *rendering*,
        # so we're going to use rounding to ensure that lines with
        # very similar left edges are grouped together.
        self.left_edge = Decimal(int((lttextline.x0 - 0.5) / 2) * 2)

    def is_left_edge_near(self, other):
        return abs(self.left_edge - other.left_edge) <= self.EDGE_THRESHOLD

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
