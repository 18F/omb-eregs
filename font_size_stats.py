import sys
from collections import Counter

from pdfminer import layout

import pdfutil


def get_font_size_stats(ltpages):
    stats = Counter()

    for item in pdfutil.iter_flattened_layout(ltpages):
        if isinstance(item, layout.LTChar):
            stats[(item.fontname, int(item.size))] += 1

    return stats


if __name__ == "__main__":
    with open(sys.argv[1], 'rb') as infile:
        ltpages = pdfutil.get_ltpages(infile)
        stats = get_font_size_stats(ltpages)

        for ((fontname, size), count) in stats.most_common(5):
            print(f"{fontname} {size}: {count}")
