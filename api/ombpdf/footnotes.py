import re
from textwrap import TextWrapper
from decimal import Decimal

from pdfminer import layout

from .document import (
    OMBDocument,
    OMBFootnoteCitation,
    OMBFootnote,
    OMBPageNumber
)
from . import util
from .fontsize import FontSize
from .horizlines import get_horizontal_lines


NUMBER_RE = re.compile(r'[0-9]')

FOOTNOTE_RE = re.compile(r'([0-9]+) (.+)')

# Maximum distance the horizontal line separating a page's footnote section
# can be from the top of the first footnote.
MAX_HORIZ_LINE_DIST = 12

# Maximum length the horizontal line separating a page's footnote section
# can be, as a fraction of the page's width.
MAX_HORIZ_LINE_LENGTH_FACTOR = 0.5


def line_contains_big_chars(line, doc):
    for char in line:
        if char.fontsize.size + Decimal('0.5') >= doc.paragraph_fontsize.size:
            return True
    return False


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
            if util.is_significantly_smaller(char.fontsize.size,
                                             doc.paragraph_fontsize.size,
                                             gap=0.7):
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


def is_horiz_line_above(doc, page, line):
    for hline in get_horizontal_lines(page):
        width = hline.end - hline.start
        vertical_dist = hline.y - line.lttextline.y1

        if (vertical_dist > 0 and
                vertical_dist < MAX_HORIZ_LINE_DIST and
                util.is_near(hline.start, line.lttextline.x0) and
                width < page.ltpage.width * MAX_HORIZ_LINE_LENGTH_FACTOR):
            return True

    return False


def annotate_footnotes(doc):
    footnotes = []
    curr_footnote = None

    def finish_footnote():
        nonlocal curr_footnote

        if curr_footnote:
            number, text, lines = curr_footnote
            # We want to track the OMBFootnote for the purpose of setting
            # annotations, but track the OMBFootnote and the line in the
            # rolling footnotes list, which is where we put footnote_plus.
            footnote = OMBFootnote(number, text)
            footnote_plus = (OMBFootnote(number, text), lines)
            for line in lines:
                line.set_annotation(footnote)
            footnotes.append(footnote_plus)
        curr_footnote = None

    for page in doc.pages:
        found_horiz_line = False
        for line in page:
            if line.annotation is not None:
                # If the annotation is page number, we assume that the
                # page number annotation is correct and that the
                # footnote detection is being too greedy.
                if line.annotation.__class__.__name__ == "OMBPageNumber":
                    continue
            if not line_contains_big_chars(line, doc):
                chars = str(line)
                match = FOOTNOTE_RE.match(chars)
                if match:
                    finish_footnote()
                    footnote, desc = match.groups()
                    curr_footnote = [int(footnote), desc, [line]]
                elif curr_footnote:
                    curr_footnote[1] += chars
                    curr_footnote[2].append(line)
                elif len(footnotes) and not found_horiz_line:
                    found_horiz_line = is_horiz_line_above(doc, page, line)
                    if found_horiz_line:
                        # Here we pull out the previous footnote and continue
                        # adding to it.
                        curr_ft = footnotes.pop()
                        curr_obj = curr_ft[0]
                        curr_num = curr_obj[0]
                        curr_txt = curr_obj[1]
                        curr_lines = curr_ft[1]
                        curr_footnote = [curr_num, curr_txt + chars, curr_lines
                                         + [line]]
            else:
                finish_footnote()
    finish_footnote()
    # Return the OMBFootnote list after applying strip() to the text:
    footnote_objs = [OMBFootnote(f[0][0], f[0][1].strip()) for f in footnotes]
    return footnote_objs


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
