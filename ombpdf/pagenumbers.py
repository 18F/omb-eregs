import re

from .document import OMBPageNumber


PAGE_NUMBER_RE = re.compile(r'^([0-9]+)$')


def get_last_nonempty_line(page):
    for line in reversed(page):
        if str(line).strip():
            return line


def annotate_page_numbers(doc):
    lines = []
    for page in doc.pages:
        line = get_last_nonempty_line(page)
        if line is None:
            continue
        match = PAGE_NUMBER_RE.match(str(line).strip())
        if match:
            line.set_annotation(OMBPageNumber(match.group(1)))
            lines.append(line)
    return lines


def main(doc):
    lines = [str(line.annotation.number)
             for line in annotate_page_numbers(doc)]
    print(f"Found the following page numbers: {', '.join(lines)}")
