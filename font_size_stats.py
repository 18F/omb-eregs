import sys
from decimal import Decimal
from collections import Counter, namedtuple

from pdfminer import layout

import pdfutil


class FontSize(namedtuple('FontSize', ['font', 'size'])):
    __slots__ = ()

    @classmethod
    def from_ltchar(cls, ltchar):
        # There can be *really* close font sizes, like
        # 16.163999999999987 vs. 16.164000000000044, so we're
        # just going to round to the nearest tenth.
        size = Decimal(ltchar.size).quantize(Decimal('.1'))

        return cls(ltchar.fontname, size)


def get_font_size_stats(ltpages):
    stats = Counter()

    for item in pdfutil.iter_flattened_layout(ltpages):
        if isinstance(item, layout.LTChar):
            stats[FontSize.from_ltchar(item)] += 1

    return stats


if __name__ == "__main__":
    with open(sys.argv[1], 'rb') as infile:
        ltpages = pdfutil.get_ltpages(infile)
        stats = get_font_size_stats(ltpages)

        for ((fontname, size), count) in stats.most_common(5):
            print(f"{fontname} {size}: {count}")
