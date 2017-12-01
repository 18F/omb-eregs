import sys
import re
from textwrap import TextWrapper

from pdfminer import layout

from .document import (
    OMBDocument,
    OMBFootnoteCitation,
    OMBFootnote,
    OMBPageNumber
)
from . import util
from .fontsize import FontSize


NUMBER_RE = re.compile(r'[0-9]')

FOOTNOTE_RE = re.compile(r'([0-9]+) (.+)')


def annotate_citations(doc):
    citations = []
    for line in doc.lines:
        prev_paragraph_chars = ''
        curr_citation = []

        def add_citation():
            citation = OMBFootnoteCitation(
                int(''.join([str(c) for c in curr_citation])),
                prev_paragraph_chars
            )
            for char in curr_citation:
                char.set_annotation(citation)
            citations.append(citation)

        for char in line:
            if char.fontsize.size < doc.paragraph_fontsize.size:
                if NUMBER_RE.match(str(char)):
                    if prev_paragraph_chars:
                        curr_citation.append(char)
            elif curr_citation:
                add_citation()
                curr_citation = []
                prev_paragraph_chars = ''
            else:
                prev_paragraph_chars += str(char)
        if curr_citation:
            add_citation()
    return citations


def annotate_footnotes(doc):
    footnotes = []
    curr_footnote = None

    def finish_footnote():
        nonlocal curr_footnote

        if curr_footnote:
            number, text, lines = curr_footnote
            footnote = OMBFootnote(number, text)
            for line in lines:
                line.set_annotation(footnote)
            footnotes.append(footnote)
        curr_footnote = None

    for line in doc.lines:
        if line.annotation is not None:
            # If the annotation is page number, we assume that the
            # page number annotation is correct and that the
            # footnote detection is being too greedy.
            if line.annotation.__class__.__name__ == "OMBPageNumber":
                continue
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
                curr_footnote = [int(footnote), desc, [line]]
            elif curr_footnote:
                curr_footnote[1] += chars
                curr_footnote[2].append(line)
        else:
            finish_footnote()
    finish_footnote()
    return footnotes


def main(doc):
    print("Citations:")
    for c in annotate_citations(doc):
        preceding_words = ' '.join(c.preceding_text.split(' ')[-3:])
        print(f"  #{c.number} appears after the text '{preceding_words}'")

    indent = "    "
    wrapper = TextWrapper(initial_indent=indent, subsequent_indent=indent)

    print("\nFootnotes:")
    for f in annotate_footnotes(doc):
        print(f"  #{f.number}:")
        print('\n'.join(wrapper.wrap(f.text)))
        print()
