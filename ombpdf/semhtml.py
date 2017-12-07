from html import escape

from . import document


class HTMLWriter:
    def __init__(self):
        self.chunks = []
        self.footnote_citations = {}

    def start_document(self, doc):
        self.chunks.append(
            f'<title>Semantic HTML output for {doc.filename}</title>\n'
        )

    def begin_element(self, tagname):
        self.chunks.append(f'<{tagname}>')

    def end_element(self, tagname):
        self.chunks.append(f'</{tagname}>\n')

    def id_for_footnote(self, number):
        return f"footnote-{number}"

    def id_for_footnote_citation(self, number):
        return f"footnote-citation-{number}"

    def create_footnote_citation(self, number):
        cit_id = self.id_for_footnote_citation(number)
        self.footnote_citations[number] = cit_id
        self.chunks.append(
            f'<sup id="{cit_id}">'
            f'<a href="#{self.id_for_footnote(number)}">'
            f'{number}</a></sup>'
        )

    def create_text(self, text):
        self.chunks.append(escape(text))

    def begin_footnotes(self):
        self.chunks.append('<h2>Footnotes</h2>\n')
        self.chunks.append('<dl>\n')

    def create_footnote(self, number, text):
        self.chunks.append(f'<dt id="{self.id_for_footnote(number)}">'
                           f'{number}</dt>\n')
        self.chunks.append(f'<dd>{text}')
        cit_id = self.footnote_citations.get(number)
        if cit_id:
            self.chunks.append(
                f' <a href="#{cit_id}">Back to citation</a>'
            )
        self.chunks.append('</dd>\n')

    def end_footnotes(self):
        self.chunks.append('</dl>\n')

    def getvalue(self):
        return ''.join(self.chunks)


class SemanticTreeBuilder:
    def __init__(self, doc, writer):
        self.doc = doc
        self.writer = writer
        self.footnotes = []
        self.block_stack = []

    def open_new_block(self, tagname, anno):
        self.block_stack.append((tagname, anno))
        self.writer.begin_element(tagname)

    def close_current_block(self):
        if self.block_stack:
            tagname, _ = self.block_stack.pop()
            self.writer.end_element(tagname)

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
                self.writer.create_footnote_citation(anno.number)
            else:
                self.writer.create_text(text)

    def process_footnotes(self):
        if not self.footnotes:
            return

        self.writer.begin_footnotes()
        curr_footnote = None
        for line in self.footnotes:
            anno = line.annotation
            if anno != curr_footnote:
                curr_footnote = anno
                self.writer.create_footnote(anno.number, anno.text)

        self.writer.end_footnotes()

    def build(self):
        self.doc.annotators.require_all()
        self.writer.start_document(self.doc)

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


def to_html(doc):
    writer = HTMLWriter()
    builder = SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.getvalue()
