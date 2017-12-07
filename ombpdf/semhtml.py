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


class HTMLBuilder:
    def __init__(self, doc):
        self.doc = doc
        self.chunks = [
            f'<title>Semantic HTML output for {doc.filename}</title>\n'
        ]
        self.footnote_citations = {}
        self.footnotes = []
        self.block_stack = []

    def open_new_block(self, tagname, anno):
        self.block_stack.append((tagname, anno))
        self.chunks.append(f'<{tagname}>')

    def close_current_block(self):
        if self.block_stack:
            tagname, _ = self.block_stack.pop()
            self.chunks.append(f'</{tagname}>\n')

    def does_current_block_match(self, anno=None, tagnames=None):
        if not self.block_stack:
            return False
        curr_tagname, curr_anno = self.block_stack[-1]
        if anno is not None:
            return anno == curr_anno
        return curr_tagname in tagnames

    def close_all_blocks(self):
        while self.block_stack:
            self.close_current_block()

    def create_new_list(self, anno):
        if anno.is_ordered:
            self.open_new_block('ol', anno)
        else:
            self.open_new_block('ul', anno)

    def process_new_list_item(self, anno):
        if self.does_current_block_match(tagnames=['li']):
            _, prev_anno = self.block_stack[-1]
            if prev_anno.list_id == anno.list_id:
                # It's another item in the same list.
                self.close_current_block()
                self.open_new_block('li', anno)
            elif prev_anno.indentation < anno.indentation:
                # It's a new nested list, inside a parent list.
                self.create_new_list(anno)
                self.open_new_block('li', anno)
            else:
                # A nested list has finished and we're back in
                # the parent list.
                self.close_current_block()  # Close final nested <li>
                self.close_current_block()  # Close nested list
                self.close_current_block()  # Close parent <li>
                self.open_new_block('li', anno)
        else:
            # It's a new list following non-list content.
            self.close_all_blocks()
            self.create_new_list(anno)
            self.open_new_block('li', anno)

    def process_line(self, line):
        for char, text in line.iter_char_chunks():
            anno = char.annotation

            if isinstance(anno, document.OMBListItemMarker):
                # Don't display this content at all.
                pass
            elif isinstance(anno, document.OMBFootnoteCitation):
                fnum = anno.number
                cit_id = id_for_footnote_citation(fnum)
                self.footnote_citations[fnum] = cit_id
                self.chunks.append(
                    f'<sup id="{cit_id}">'
                    f'<a href="#{id_for_footnote(fnum)}">'
                    f'{fnum}</a></sup>'
                )
            else:
                self.chunks.append(escape(text))

    def process_footnotes(self):
        if not self.footnotes:
            return

        self.chunks.append('<h2>Footnotes</h2>\n')
        self.chunks.append('<dl>\n')
        curr_footnote = None
        for line in self.footnotes:
            anno = line.annotation
            if anno != curr_footnote:
                curr_footnote = anno
                self.chunks.append(f'<dt id="{id_for_footnote(anno.number)}">'
                                   f'{anno.number}</dt>\n')
                self.chunks.append(f'<dd>{anno.text}')
                cit_id = self.footnote_citations.get(anno.number)
                if cit_id:
                    self.chunks.append(
                        f' <a href="#{cit_id}">Back to citation</a>'
                    )
                self.chunks.append('</dd>\n')

        self.chunks.append('</dl>\n')

    def build(self):
        self.doc.annotators.require_all()

        for line in self.doc.lines:
            anno = line.annotation
            ignore_line = False
            if anno and self.does_current_block_match(anno=anno):
                pass
            else:
                if isinstance(anno, document.OMBFootnote):
                    self.footnotes.append(line)
                    ignore_line = True
                elif isinstance(anno, document.OMBPageNumber):
                    ignore_line = True
                elif isinstance(anno, document.OMBParagraph):
                    self.close_all_blocks()
                    self.open_new_block('p', anno)
                elif isinstance(anno, document.OMBListItem):
                    self.process_new_list_item(anno)
                elif isinstance(anno, document.OMBHeading):
                    self.close_all_blocks()
                    self.open_new_block(f'h{anno.level}', anno)

            if not ignore_line:
                self.process_line(line)

        self.close_all_blocks()
        self.process_footnotes()

        return ''.join(self.chunks)

def to_html(doc):
    builder = HTMLBuilder(doc)

    return builder.build()
