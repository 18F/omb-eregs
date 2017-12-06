from functools import total_ordering

from .document import OMBHeading
from .util import is_x_smaller_than_y


@total_ordering
class Style:
    """
    An ordered class representing styling information for document
    headers.

    We want to be able to compare one style to another to determine
    which is a higher "heading level" than the other, e.g. <H1> vs. <H2>,
    hence the ordering.
    """

    COMPARISON_GAP = 0.2

    def __init__(self, is_underlined, fontsize):
        self.is_underlined = is_underlined
        self.fontsize = fontsize

    @classmethod
    def from_char(cls, char):
        return cls(char.is_underlined, char.fontsize)

    def complexity_score(self):
        score = 0
        if self.is_underlined:
            score += 1
        if self.fontsize.font.is_bold:
            score += 1
        if self.fontsize.font.is_italic:
            score += 1
        return score

    def __eq__(self, other):
        return (self.is_underlined == other.is_underlined and
                self.fontsize.is_near(other.fontsize,
                                      gap=self.COMPARISON_GAP))

    def __lt__(self, other):
        if is_x_smaller_than_y(self.fontsize.size,
                               other.fontsize.size,
                               gap=self.COMPARISON_GAP):
            return True
        if is_x_smaller_than_y(other.fontsize.size,
                               self.fontsize.size,
                               gap=self.COMPARISON_GAP):
            return False
        # The fonts are the same size, so compare them by complexity.
        return self.complexity_score() < other.complexity_score()

    def __hash__(self):
        return hash((self.is_underlined, self.fontsize))

    def __repr__(self):
        return (f'{self.__class__.__name__}('
                f'is_underlined={self.is_underlined}, '
                f'fontsize={self.fontsize})')


def get_heading_line_style(line):
    style = None
    for char, text in line.iter_char_chunks():
        if not text.strip():
            continue
        if style is not None:
            # This line has multiple styles, so we'll assume
            # (possibly incorrectly) that it can't be a heading.
            return None
        style = Style.from_char(char)
    return style


def annotate_headings(doc):
    doc.annotators.require('underlines')

    paragraph_style = Style(False, doc.paragraph_fontsize)
    headings = []
    styles = set()
    for line in doc.lines:
        if (line.left_edge == doc.left_edge and
                not line.is_blank() and
                line.annotation is None):
            style = get_heading_line_style(line)
            if style is not None and style > paragraph_style:
                headings.append((style, line))
                styles.add(style)

    styles = list(styles)
    styles.sort(reverse=True)

    lines = []
    for style, line in headings:
        level = styles.index(style) + 1
        line.set_annotation(OMBHeading(level))
        lines.append(line)

    return lines


def main(doc):
    lines = annotate_headings(doc)
    for line in lines:
        print(f'H{line.annotation.level}: {str(line)}')
