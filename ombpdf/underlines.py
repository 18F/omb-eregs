from collections import namedtuple

from pdfminer import layout

from . import util


HorizontalLine = namedtuple('HorizontalLine', ['y', 'start', 'end'])

# Maximum height of an underline (in points, I think).
MAX_LINE_HEIGHT = 4.0

# Percentage of bbox height underline can be from bottom of a line's bbox.
MAX_LINE_BBOX_DIST = 0.25

# Maximum distance the left/right of a character's bbox can be from the
# start/end of an underline (in points, I think).
EPSILON = 1.0


def set_underlines(doc):
    underlines = []
    for page in doc.pages:
        underlines.extend(set_underlines_in_page(page))
    return underlines


def set_underlines_in_page(page):
    underlines = []
    hlines = []
    for rect in util.iter_flattened_layout(page.ltpage, layout.LTRect):
        x0, y0 = rect.pts[0]
        x1, y1 = rect.pts[2]
        height = y1 - y0
        if y1 - y0 < MAX_LINE_HEIGHT:
            hlines.append(HorizontalLine((y0 + y1) / 2, x0, x1))
    for line in page:
        for hline in hlines:
            tl = line.lttextline
            height = tl.y1 - tl.y0
            if abs(tl.y0 - hline.y) < MAX_LINE_BBOX_DIST * height:
                chars = []
                in_underline = False
                for char in line:
                    if in_underline:
                        if char.ltchar.x1 - EPSILON > hline.end:
                            break
                        else:
                            chars.append(char)
                    elif (str(char) != ' ' and
                          char.ltchar.x0 + EPSILON >= hline.start):
                        in_underline = True
                        chars.append(char)
                if chars:
                    underlines.append(chars)
                    for char in chars:
                        char.set_underlined()
    return underlines


def main(doc):
    underlines = set_underlines(doc)
    print("Underlined words:")
    for chars in underlines:
        text = ''.join([str(c) for c in chars])
        print(f"  {text}")
