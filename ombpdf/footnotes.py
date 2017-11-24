import sys
import re

from pdfminer import layout

from .document import OMBDocument
from . import util
from .fontsize import FontSize


NUMBER_RE = re.compile(r'[0-9]')

FOOTNOTE_RE = re.compile(r'([0-9]+) (.+)')


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


def for_all_chars(lttextline, fn):
    return len([
        ltchar for ltchar in
        util.iter_flattened_layout(lttextline, layout.LTChar)
        if not fn(ltchar, FontSize.from_ltchar(ltchar))
    ]) == 0


def find_footnotes(doc):
    footnotes = []
    curr_footnote = None

    def finish_footnote():
        nonlocal curr_footnote

        if curr_footnote:
            footnotes.append(tuple(curr_footnote))
        curr_footnote = None

    for line in doc.iter_flattened(layout.LTTextLineHorizontal):
        only_small_chars = for_all_chars(
            line,
            lambda _, fs: fs.size < doc.paragraph_fontsize.size
        )
        if only_small_chars:
            chars = line.get_text()
            match = FOOTNOTE_RE.match(chars)
            if match:
                finish_footnote()
                footnote, desc = match.groups()
                curr_footnote = [int(footnote), desc]
            elif curr_footnote:
                curr_footnote[1] += chars
        else:
            finish_footnote()
    finish_footnote()
    return footnotes


if __name__ == "__main__":
    with open(sys.argv[1], 'rb') as infile:
        doc = OMBDocument.from_file(infile)
        print(find_citations(doc))
        print(find_footnotes(doc))
