from html import escape

from . import document


HTML_INTRO = """\
<!DOCTYPE html>
<meta charset="utf-8">
"""


def id_for_footnote(fnum):
    return f"footnote-{fnum}"


def id_for_footnote_citation(fnum):
    return f"footnote-citation-{fnum}"


def to_html(doc):
    doc.annotators.require_all()
    chunks = [
        f'<title>Semantic HTML output for {doc.filename}</title>\n'
    ]

    footnote_citations = {}
    footnotes = []
    block_stack = []

    def open_new_block(tagname, anno):
        block_stack.append((tagname, anno))
        chunks.append(f'<{tagname}>')

    def close_current_block():
        if block_stack:
            tagname, _ = block_stack.pop()
            chunks.append(f'</{tagname}>\n')

    def does_current_block_match(anno=None, tagnames=None):
        if not block_stack:
            return False
        curr_tagname, curr_anno = block_stack[-1]
        if anno is not None:
            return (anno.__class__ == curr_anno.__class__ and
                    anno == curr_anno)
        return curr_tagname in tagnames

    def close_all_blocks():
        while block_stack:
            close_current_block()

    def create_new_list(anno):
        if anno.is_ordered:
            open_new_block('ol', anno)
        else:
            open_new_block('ul', anno)

    def process_new_list_item(anno):
        if does_current_block_match(tagnames=['li']):
            _, prev_anno = block_stack[-1]
            if prev_anno.list_id == anno.list_id:
                # It's another item in the same list.
                close_current_block()
                open_new_block('li', anno)
            elif prev_anno.indentation < anno.indentation:
                # It's a new nested list, inside a parent list.
                create_new_list(anno)
                open_new_block('li', anno)
            else:
                # A nested list has finished and we're back in
                # the parent list.
                close_current_block()  # Close final nested <li>
                close_current_block()  # Close nested list
                close_current_block()  # Close parent <li>
                open_new_block('li', anno)
        else:
            # It's a new list following non-list content.
            close_all_blocks()
            create_new_list(anno)
            open_new_block('li', anno)

    def process_line(line):
        for char, text in line.iter_char_chunks():
            anno = char.annotation

            if isinstance(anno, document.OMBListItemMarker):
                # Don't display this content at all.
                pass
            elif isinstance(anno, document.OMBFootnoteCitation):
                fnum = anno.number
                cit_id = id_for_footnote_citation(fnum)
                footnote_citations[fnum] = cit_id
                chunks.append(
                    f'<sup id="{cit_id}">'
                    f'<a href="#{id_for_footnote(fnum)}">'
                    f'{fnum}</a></sup>'
                )
            else:
                chunks.append(escape(text))

    for line in doc.lines:
        anno = line.annotation
        ignore_line = False
        if anno and does_current_block_match(anno=anno):
            pass
        else:
            if isinstance(anno, document.OMBFootnote):
                footnotes.append(line)
                ignore_line = True
            elif isinstance(anno, document.OMBPageNumber):
                ignore_line = True
            elif isinstance(anno, document.OMBParagraph):
                close_all_blocks()
                open_new_block('p', anno)
            elif isinstance(anno, document.OMBListItem):
                process_new_list_item(anno)
            elif isinstance(anno, document.OMBHeading):
                close_all_blocks()
                open_new_block(f'h{anno.level}', anno)

        if not ignore_line:
            process_line(line)

    close_all_blocks()

    if footnotes:
        chunks.append('<h2>Footnotes</h2>\n')
        chunks.append('<dl>\n')
        curr_footnote = None
        for line in footnotes:
            anno = line.annotation
            if anno != curr_footnote:
                curr_footnote = anno
                chunks.append(f'<dt id="{id_for_footnote(anno.number)}">'
                              f'{anno.number}</dt>\n')
                chunks.append(f'<dd>{anno.text}')
                cit_id = footnote_citations.get(anno.number)
                if cit_id:
                    chunks.append(
                        f' <a href="#{cit_id}">Back to citation</a>'
                    )
                chunks.append('</dd>\n')

        chunks.append('</dl>\n')

    return ''.join(chunks)
