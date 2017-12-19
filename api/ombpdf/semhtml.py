from html import escape

from . import semtree


class HTMLWriter(semtree.Writer):
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

    def begin_document(self, doc):
        self.chunks.append(
            f'<title>Semantic HTML output for {doc.title}</title>\n'
        )

    def end_document(self, doc):
        pass

    def begin_heading(self, heading):
        self.chunks.append(f'<h{heading.level}>')

    def end_heading(self, heading):
        self.chunks.append(f'</h{heading.level}>\n')

    def begin_paragraph(self, p):
        self.chunks.append(f'<p>')

    def end_paragraph(self, p):
        self.chunks.append(f'</p>\n')

    def begin_list(self, li):
        self.chunks.append('<ol>' if li.is_ordered else '<ul>')

    def end_list(self, li):
        self.chunks.append('</ol>\n' if li.is_ordered else '</ul>\n')

    def begin_list_item(self, p):
        self.chunks.append(f'<li>')

    def end_list_item(self, p):
        self.chunks.append(f'</li>\n')

    def create_footnote_citation(self, cit):
        cit_id = self.id_for_footnote_citation(cit.number)
        self.footnote_citations[cit.number] = cit_id
        self.chunks.append(
            f'<sup id="{cit_id}">'
            f'<a href="#{self.id_for_footnote(cit.number)}">'
            f'{cit.number}</a></sup>'
        )

    def begin_footnote_list(self, fl):
        self.chunks.append('<h2>Footnotes</h2>\n')
        self.chunks.append('<dl>\n')

    def end_footnote_list(self, fl):
        self.chunks.append('</dl>\n')

    def begin_footnote(self, f):
        self.chunks.append(f'<dt id="{self.id_for_footnote(f.number)}">'
                           f'{f.number}</dt>\n')
        self.chunks.append(f'<dd>')

    def end_footnote(self, f):
        cit_id = self.footnote_citations.get(f.number)
        if cit_id:
            self.chunks.append(
                f' <a href="#{cit_id}">Back to citation</a>'
            )
        self.chunks.append('</dd>\n')

    def create_text(self, text):
        self.chunks.append(escape(text))


def to_html(doc):
    writer = HTMLWriter()
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.getvalue()
