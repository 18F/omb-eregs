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
    for line in doc.lines:
        prev_paragraph_chars = ''
        curr_citation = ''

        def add_citation():
            citations.append((int(curr_citation), prev_paragraph_chars))

        for char in line:
            if char.fontsize.size < doc.paragraph_fontsize.size:
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


def find_footnotes(doc):
    footnotes = []
    curr_footnote = None

    def finish_footnote():
        nonlocal curr_footnote

        if curr_footnote:
            footnotes.append(tuple(curr_footnote))
        curr_footnote = None

    for line in doc.lines:
        big_chars = [
            char for char in line
            if char.fontsize.size >= doc.paragraph_fontsize.size
        ]
        if not big_chars:
            chars = str(line)
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
