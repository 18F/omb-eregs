from collections import namedtuple

from pdfminer import layout

from . import util

HorizontalLine = namedtuple('HorizontalLine', ['y', 'start', 'end'])

# Maximum height of a horizontal line (in points, I think).
MAX_LINE_HEIGHT = 4.0


def get_horizontal_lines(page):
    hlines = []
    for rect in util.iter_flattened_layout(page.ltpage, layout.LTRect):
        x0, y0 = rect.pts[0]
        x1, y1 = rect.pts[2]
        if y1 - y0 < MAX_LINE_HEIGHT:
            hlines.append(HorizontalLine((y0 + y1) / 2, x0, x1))
    for line in util.iter_flattened_layout(page.ltpage, layout.LTLine):
        x0, y0 = line.pts[0]
        x1, y1 = line.pts[1]
        if util.is_near(y0, y1) and line.linewidth <= MAX_LINE_HEIGHT:
            hlines.append(HorizontalLine(y0, x0, x1))
    return hlines
