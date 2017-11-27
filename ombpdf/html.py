from html import escape

from .document import OMBFootnoteCitation, OMBFootnote, OMBPageNumber
from . import footnotes, underlines, pagenumbers


HTML_INTRO = """\
<!DOCTYPE html>
<meta charset="utf-8">
<style>
html {
    white-space: pre;
    font: serif;
}

.underline {
    text-decoration: underline;
}

.bold {
    font-weight: bold;
}

.italic {
    font-style: italic;
}

.footnote-citation {
    vertical-align: super;
}

.footnote {
    border-left: 4px solid gray;
    padding-left: 1em;
}

.page-number {
    color: lightgray;
}
</style>
<title>HTML output</title>
"""


def id_for_footnote(fnum):
    return f"footnote-{fnum}"


def to_html(doc):
    footnotes.annotate_citations(doc)
    footnotes.annotate_footnotes(doc)
    underlines.set_underlines(doc)
    pagenumbers.annotate_page_numbers(doc)

    footnotes_defined = []
    chunks = []
    for page in doc.pages:
        for line in page:
            line_classes = []
            line_attrs = []
            if isinstance(line.annotation, OMBFootnote):
                line_classes.append('footnote')
                fnum = line.annotation.number
                line_attrs.append(f'title="Footnote {fnum}"')
                if fnum not in footnotes_defined:
                    footnotes_defined.append(fnum)
                    line_attrs.append(f'id="{id_for_footnote(fnum)}"')
            elif isinstance(line.annotation, OMBPageNumber):
                line_classes.append('page-number')
            elif line.annotation is not None:
                raise Exception(f'Unknown annotation: {line.annotation}')

            if line_classes:
                line_attrs.append(f'class="{" ".join(line_classes)}"')

            chunks.append(f'<div {" ".join(line_attrs)}>')

            for (first_char, text) in line.iter_char_chunks():
                tag = 'span'
                classes = []
                attrs = [
                    f'style="font-size: {first_char.fontsize.size}pt"',
                ]

                if first_char.is_underlined:
                    classes.append('underline')
                if first_char.fontsize.font.is_sans_serif:
                    classes.append('sans-serif')
                if first_char.fontsize.font.is_italic:
                    classes.append('italic')
                if first_char.fontsize.font.is_bold:
                    classes.append('bold')

                if isinstance(first_char.annotation, OMBFootnoteCitation):
                    classes.append('footnote-citation')
                    fnum = first_char.annotation.number
                    attrs.append(f'href="#{id_for_footnote(fnum)}"')
                    tag = 'a'
                elif first_char.annotation is not None:
                    raise Exception(f'Unknown annotation for {first_char}')

                if classes:
                    attrs.append(f'class="{" ".join(classes)}"')

                chunks.append(
                    f'<{tag} {" ".join(attrs)}>{escape(text)}</{tag}>'
                )

            chunks.append('</div>')
    return HTML_INTRO + ''.join(chunks)
