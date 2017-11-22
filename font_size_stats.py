import sys
from decimal import Decimal
from collections import Counter

from pdfminer import layout

import pdfutil


def get_font_size_stats(ltpages):
    stats = Counter()

    for item in pdfutil.iter_flattened_layout(ltpages):
        if isinstance(item, layout.LTChar):
            # There can be *really* close font sizes, like
            # 16.163999999999987 vs. 16.164000000000044, so we're
            # just going to round to the nearest tenth.
            size = Decimal(item.size).quantize(Decimal('.1'))

            stats[(item.fontname, size)] += 1

    return stats


if __name__ == "__main__":
    with open(sys.argv[1], 'rb') as infile:
        ltpages = pdfutil.get_ltpages(infile)
        stats = get_font_size_stats(ltpages)

        for ((fontname, size), count) in stats.most_common(5):
            print(f"{fontname} {size}: {count}")
