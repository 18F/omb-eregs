import re
import weakref
from collections import Counter, namedtuple
from decimal import Decimal

from pdfminer import layout

from . import util


class FontName(str):
    BOLD_RE = re.compile(r'bold', re.I)
    ITALIC_RE = re.compile(r'(italic|oblique)', re.I)
    SANS_SERIF_RE = re.compile(r'(arial|helvetica)', re.I)

    @property
    def is_sans_serif(self):
        '''
        >>> FontName('Times').is_sans_serif
        False

        >>> FontName('Arial').is_sans_serif
        True
        '''

        return bool(self.SANS_SERIF_RE.search(self))

    @property
    def is_bold(self):
        '''
        >>> FontName('Times').is_bold
        False

        >>> FontName('Times Bold').is_bold
        True
        '''

        return bool(self.BOLD_RE.search(self))

    @property
    def is_italic(self):
        '''
        >>> FontName('Times').is_italic
        False

        >>> FontName('Times Italic').is_italic
        True

        >>> FontName('Times Oblique').is_italic
        True
        '''

        return bool(self.ITALIC_RE.search(self))


class FontSize(namedtuple('FontSize', ['font', 'size'])):
    __slots__ = ()

    __cache = weakref.WeakKeyDictionary()

    def is_near(self, other, gap=1):
        if self.font != other.font:
            return False
        return util.is_near(self.size, other.size, gap=gap)

    @classmethod
    def from_ltchar(cls, ltchar):
        if ltchar not in cls.__cache:
            # There can be *really* close font sizes, like
            # 16.163999999999987 vs. 16.164000000000044, so we're
            # just going to round to the nearest tenth.
            size = Decimal(ltchar.size).quantize(Decimal('.1'))

            cls.__cache[ltchar] = cls(FontName(ltchar.fontname), size)
        return cls.__cache[ltchar]


def get_font_size_stats(ltpages):
    stats = Counter()

    for item in util.iter_flattened_layout(ltpages, layout.LTChar):
        stats[FontSize.from_ltchar(item)] += 1

    return stats


def main(ltpages):
    stats = get_font_size_stats(ltpages)

    for ((fontname, size), count) in stats.most_common(5):
        print(f"{fontname} @ {size}: {count} characters")
