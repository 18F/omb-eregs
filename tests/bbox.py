import re
from collections import namedtuple

from .conftest import load_document


BboxInfo = namedtuple('BboxInfo', [
    'pdf',
    'page',
    'x0',
    'y0',
    'x1',
    'y1',
])

RAWLAYOUT_URL_RE = re.compile(r'^.+\/rawlayout\/(.*)\?bbox=([0-9.,]+).*$')

def parse_rawlayout_url(url):
    '''
    >>> parse_rawlayout_url('http://localhost:5000/rawlayout/2016/m_16_19_1.pdf?bbox=4,515,16.9375,559,93.9375#4')
    BboxInfo(pdf='2016/m_16_19_1.pdf', page=4, x0=515.0, y0=16.9375, x1=559.0, y1=93.9375)

    >>> parse_rawlayout_url('blah')
    Traceback (most recent call last):
    ...
    ValueError: 'blah' is not a valid rawlayout URL
    '''

    match = RAWLAYOUT_URL_RE.match(url)

    if not match:
        raise ValueError(f"'{url}' is not a valid rawlayout URL")

    pdf = match.group(1)
    numbers = match.group(2).split(',')
    page = int(numbers[0])
    x0 = float(numbers[1])
    y0 = float(numbers[2])
    x1 = float(numbers[3])
    y1 = float(numbers[4])

    return BboxInfo(pdf, page, x0, y0, x1, y1)


def find_line(url):
    info = parse_rawlayout_url(url)
    doc = load_document(info.pdf)
    page = doc.pages[info.page - 1]
    lines = lines_in_bbox(page, info.x0, info.y0, info.x1, info.y1)

    assert len(lines) == 1

    return (doc, page, lines[0])


def lines_in_bbox(page, x0, y0, x1, y1):
    '''
    Returns a list of all lines on the page that are fully contained in the
    given bounding box.
    '''

    return [
        line for line in page
        if (line.lttextline.x0 >= x0 and
            line.lttextline.y0 >= y0 and
            line.lttextline.x1 <= x1 and
            line.lttextline.y1 <= y1)
    ]
