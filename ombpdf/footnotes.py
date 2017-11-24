import sys
import re

from pdfminer import layout

from .document import OMBDocument
from . import util
from .fontsize import FontSize


NUMBER_RE = re.compile(r'[0-9]')


def find_citations(doc):
    citations = []
    for line in doc.iter_flattened(layout.LTTextLineHorizontal):
        prev_paragraph_chars = ''
        curr_citation = ''

        def add_citation():
            citations.append((curr_citation, prev_paragraph_chars))

        for ltchar in util.iter_flattened_layout(line, layout.LTChar):
            char = ltchar.get_text()
            fs = FontSize.from_ltchar(ltchar)
            if fs.size < doc.paragraph_fontsize.size:
                if NUMBER_RE.match(char):
                    if prev_paragraph_chars:
                        curr_citation += char
            elif curr_citation:
                add_citation()
                curr_citation = ''
                prev_paragraph_chars = ''
            else:
                prev_paragraph_chars += char
        if curr_citation:
            add_citation()
    return citations


if __name__ == "__main__":
    with open(sys.argv[1], 'rb') as infile:
        print(find_citations(OMBDocument.from_file(infile)))
