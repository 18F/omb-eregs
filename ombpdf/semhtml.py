from html import escape

from . import document


class Element:
    '''
    Represents a semantic component of a document.
    '''

    # A void element is an element that has no text content
    # inside it, e.g. an <img> in HTML.
    is_void = False


class Document(Element):
    def __init__(self, title):
        self.title = title


class Paragraph(Element): pass


class List(Element):
    def __init__(self, is_ordered):
        self.is_ordered = is_ordered


class ListItem(Element): pass


class Heading(Element):
    def __init__(self, level):
        self.level = level


class FootnoteCitation(Element):
    is_void = True

    def __init__(self, number):
        self.number = number


class FootnoteList(Element): pass


class Footnote(Element):
    is_void = True

    def __init__(self, number, text):
        self.number = number
        self.text = text


class Writer:
    '''
    A Writer implements the Visitor pattern for Elements.
    '''

    def _dispatch_method(self, prefix, el):
        method = getattr(self, f'{prefix}_{el.__class__.__name__}')
        method(el)

    def begin_element(self, el):
        '''
        Begins a non-void Element.
        '''

        assert not el.is_void
        self._dispatch_method('begin', el)

    def end_element(self, el):
        '''
        Ends a non-void Element.
        '''

        assert not el.is_void
        self._dispatch_method('end', el)

    def create_element(self, el):
        '''
        Creates a void Element.
        '''

        assert el.is_void
        self._dispatch_method('create', el)


class HTMLWriter(Writer):
    '''
    Concrete Writer for HTML.
    '''

    def __init__(self):
        self.chunks = []
        self.footnote_citations = {}

    def id_for_footnote(self, number):
        return f"footnote-{number}"

    def id_for_footnote_citation(self, number):
        return f"footnote-citation-{number}"

    def getvalue(self):
        return ''.join(self.chunks)

    # Below are Writer methods.

    def begin_Document(self, doc):
        self.chunks.append(
            f'<title>Semantic HTML output for {doc.title}</title>\n'
        )

    def end_Document(self, doc):
        pass

    def begin_Heading(self, heading):
        self.chunks.append(f'<h{heading.level}>')

    def end_Heading(self, heading):
        self.chunks.append(f'</h{heading.level}>\n')

    def begin_Paragraph(self, p):
        self.chunks.append(f'<p>')

    def end_Paragraph(self, p):
        self.chunks.append(f'</p>\n')

    def begin_List(self, li):
        self.chunks.append('<ol>' if li.is_ordered else '<ul>')

    def end_List(self, li):
        self.chunks.append('</ol>\n' if li.is_ordered else '</ul>\n')

    def begin_ListItem(self, p):
        self.chunks.append(f'<li>')

    def end_ListItem(self, p):
        self.chunks.append(f'</li>\n')

    def create_FootnoteCitation(self, cit):
        cit_id = self.id_for_footnote_citation(cit.number)
        self.footnote_citations[cit.number] = cit_id
        self.chunks.append(
            f'<sup id="{cit_id}">'
            f'<a href="#{self.id_for_footnote(cit.number)}">'
            f'{cit.number}</a></sup>'
        )

    def begin_FootnoteList(self, fl):
        self.chunks.append('<h2>Footnotes</h2>\n')
        self.chunks.append('<dl>\n')

    def end_FootnoteList(self, fl):
        self.chunks.append('</dl>\n')

    def create_Footnote(self, f):
        self.chunks.append(f'<dt id="{self.id_for_footnote(f.number)}">'
                           f'{f.number}</dt>\n')
        self.chunks.append(f'<dd>{f.text}')
        cit_id = self.footnote_citations.get(f.number)
        if cit_id:
            self.chunks.append(
                f' <a href="#{cit_id}">Back to citation</a>'
            )
        self.chunks.append('</dd>\n')

    def create_text(self, text):
        self.chunks.append(escape(text))


class SemanticTreeBuilder:
    '''
    A class that iterates through an OMBDocument, generates semantic
    Elements and outputs them to a Writer.
    '''

    def __init__(self, doc, writer):
        self.doc = doc
        self.writer = writer
        self.footnotes = []
        self.block_stack = []

    def open_new_block(self, el, anno):
        self.block_stack.append((el, anno))
        self.writer.begin_element(el)

    def close_current_block(self):
        if self.block_stack:
            el, _ = self.block_stack.pop()
            self.writer.end_element(el)

    def does_current_block_match(self, anno=None, el_class=None):
        if not self.block_stack:
            return False
        curr_el, curr_anno = self.block_stack[-1]
        if anno is not None:
            return anno == curr_anno
        return isinstance(curr_el, el_class)

    def close_all_blocks(self):
        while self.block_stack:
            self.close_current_block()

    def process_new_list_item(self, anno):
        if self.does_current_block_match(el_class=ListItem):
            _, prev_anno = self.block_stack[-1]
            if prev_anno.list_id == anno.list_id:
                # It's another item in the same list.
                self.close_current_block()
                self.open_new_block(ListItem(), anno)
            elif prev_anno.indentation < anno.indentation:
                # It's a new nested list, inside a parent list.
                self.open_new_block(List(anno.is_ordered), anno)
                self.open_new_block(ListItem(), anno)
            else:
                # A nested list has finished and we're back in
                # the parent list.
                self.close_current_block()  # Close final nested <li>
                self.close_current_block()  # Close nested list
                self.close_current_block()  # Close parent <li>
                self.open_new_block(ListItem(), anno)
        else:
            # It's a new list following non-list content.
            self.close_all_blocks()
            self.open_new_block(List(anno.is_ordered), anno)
            self.open_new_block(ListItem(), anno)

    def process_line(self, line):
        for char, text in line.iter_char_chunks():
            anno = char.annotation

            if isinstance(anno, document.OMBListItemMarker):
                # Don't display this content at all.
                pass
            elif isinstance(anno, document.OMBFootnoteCitation):
                self.writer.create_element(FootnoteCitation(anno.number))
            else:
                self.writer.create_text(text)

    def process_footnotes(self):
        if not self.footnotes:
            return

        fl = FootnoteList()

        self.writer.begin_element(fl)

        curr_footnote = None
        for line in self.footnotes:
            anno = line.annotation
            if anno != curr_footnote:
                curr_footnote = anno
                self.writer.create_element(Footnote(anno.number, anno.text))

        self.writer.end_element(fl)

    def build(self):
        self.doc.annotators.require_all()
        doc_el = Document(title=self.doc.filename)
        self.writer.begin_element(doc_el)

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
                    self.open_new_block(Paragraph(), anno)
                elif isinstance(anno, document.OMBListItem):
                    self.process_new_list_item(anno)
                elif isinstance(anno, document.OMBHeading):
                    self.close_all_blocks()
                    self.open_new_block(Heading(anno.level), anno)

            if not ignore_line:
                self.process_line(line)

        self.close_all_blocks()
        self.process_footnotes()
        self.writer.end_element(doc_el)


def to_html(doc):
    writer = HTMLWriter()
    builder = SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.getvalue()
