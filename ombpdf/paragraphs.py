import re

from .document import OMBParagraph


PARAGRAPH_END_RE = re.compile(r'.+\.\s*$')


def cull_footer(page):
    lines = page[:]
    to_remove = []
    for line in reversed(lines):
        if line.annotation or line.is_blank():
            to_remove.append(line)
        else:
            break
    for line in to_remove:
        lines.remove(line)
    return lines


def annotate_paragraphs(doc):
    doc.annotators.require('footnotes', 'page_numbers')
    in_paragraph = False
    paragraph_id = 0
    paragraphs = {}
    for page in doc.pages:
        for line in cull_footer(page):
            if line.is_blank():
                in_paragraph = False
            elif line.annotation is None and line.left_edge == doc.left_edge:
                first_char = line[0]
                if first_char.fontsize == doc.paragraph_fontsize:
                    if not in_paragraph:
                        in_paragraph = True
                        paragraph_id += 1
                        paragraphs[paragraph_id] = []
                    line.set_annotation(OMBParagraph(paragraph_id))
                    paragraphs[paragraph_id].append(line)
        if in_paragraph:
            if PARAGRAPH_END_RE.match(str(line)):
                in_paragraph = False
    return paragraphs
