from html import escape
from decimal import Decimal


HTML_INTRO = """\
<!DOCTYPE html>
<meta charset="utf-8">
<style>
* {
    box-sizing: border-box;
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
}

html, body {
    font-family: sans-serif;
}

.page {
    border: 1px solid black;
    position: relative;
    display: inline-block;
    overflow: hidden;
}

.char {
    background: rgba(0, 255, 0, 0.2);
/*    border-left: 1px solid blue; */
    color: lightgray;
    position: absolute;
    overflow: hidden;
    font-size: 0;
}
</style>
"""

PREAMBLE = """\
<p>
  This page is primarily intended to show the bounding boxes of various
  page elements.
</p>
<p>
  Inspect this page with developer tools to obtain more details.
</p>
"""

def to_px_style_attr(**kwargs):
    '''
    >>> to_px_style_attr(width=50.12345, height=40.65321)
    'style="height: 40.65px; width: 50.12px"'
    '''

    props = []
    for name, val in kwargs.items():
        val = Decimal(val).quantize(Decimal('.01'))
        props.append(f'{name}: {val}px')
    props.sort()
    css = '; '.join(props)
    return f'style="{css}"'


def to_html(doc):
    chunks = [
        HTML_INTRO,
        f'<title>Raw layout for {doc.filename}</title>\n',
        f'<h1>Raw layout for <code>{doc.filename}</code></h1>\n',
        PREAMBLE,
    ]
    for page in doc.pages:
        pagestyle = to_px_style_attr(width=page.ltpage.width,
                                     height=page.ltpage.height)
        chunks.append(f'<h2>Page {page.number}</h2>')
        chunks.append(f'<div class="page" {pagestyle}>\n')
        for line in page:
            chunks.append(f'<div class="line" '
                          f'data-str="{escape(str(line))}">\n')
            for char in line:
                charstyle = to_px_style_attr(
                    top=page.ltpage.height - char.ltchar.y1,
                    left=char.ltchar.x0,
                    width=char.ltchar.width,
                    height=char.ltchar.height,
                )
                chunks.append(f'<div class="char" {charstyle}>{char}</div>\n')
            chunks.append(f'</div>')
        chunks.append(f'</div>\n')

    chunks.append(f'<script src="/static/js/main.bundle.js"></script>')

    return ''.join(chunks)
