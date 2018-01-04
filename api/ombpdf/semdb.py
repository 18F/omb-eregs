import logging

from django.db import transaction

from document.models import DocNode, FootnoteCitation
from document.tree import DocCursor

from . import semtree

logger = logging.getLogger(__name__)


class PDFAwareCursor(DocCursor):
    """Extension of DocCursor which also tracks the PDF element which created
    each node."""
    @property
    def pdf_node(self):
        return self.tree.node[self.identifier].get('pdf_node')

    @pdf_node.setter
    def pdf_node(self, value):
        self.tree.node[self.identifier]['pdf_node'] = value


def to_db(doc, policy):
    writer = DatabaseWriter(policy)
    builder = semtree.SemanticTreeBuilder(doc, writer)
    builder.build()

    with transaction.atomic():
        writer.cursor.nested_set_renumber()
        # Work around for a Django bug (arguably) that will insert nulls in
        # place of foreign key ids
        # See https://code.djangoproject.com/ticket/23449
        footnote_citations = writer.footnote_citations.values()
        for footnote_citation in footnote_citations:
            footnote_citation.doc_node = footnote_citation.doc_node
            footnote_citation.footnote_node = footnote_citation.footnote_node
        FootnoteCitation.objects.bulk_create(footnote_citations)

    return writer.cursor


class DatabaseWriter(semtree.Writer):
    def __init__(self, policy):
        self.cursor_stack = [PDFAwareCursor.new_tree('policy', policy=policy)]
        self.footnote_citations = {}

    @property
    def cursor(self):
        return self.cursor_stack[-1]

    @property
    def sec_level(self):
        return self.cursor.ancestor_node_types().count('sec')

    def end_element(self, el):
        self.cursor.model.text = self.cursor.text.rstrip()
        super().end_element(el)

    def begin_document(self, doc):
        pass

    def end_document(self, doc):
        self.cursor_stack = self.cursor_stack[:1]

    def begin_heading(self, heading):
        while heading.level <= self.sec_level:
            self.cursor_stack.pop()
        while heading.level > self.sec_level:
            self.cursor_stack.append(self.cursor.add_child('sec'))
        self.cursor_stack.append(self.cursor.add_child('heading'))
        self.cursor.pdf_node = heading

    def end_heading(self, heading):
        text = self.cursor.text.strip()
        self.cursor_stack.pop()
        max_length = DocNode._meta.get_field('title').max_length
        if len(text) > max_length:
            logger.warning('Heading too long. Misparse? %s', text)
        self.cursor.model.title = text[:max_length]

    def begin_paragraph(self, p):
        self.cursor_stack.append(self.cursor.add_child('para'))
        self.cursor.pdf_node = p

    def end_paragraph(self, p):
        self.cursor_stack.pop()

    def begin_list(self, li):
        self.cursor_stack.append(self.cursor.add_child('list'))
        self.cursor.pdf_node = li

    def end_list(self, li):
        self.cursor_stack.pop()

    def begin_list_item(self, p):
        li = self.cursor.add_child('listitem')
        self.cursor_stack.append(li.add_child('para'))
        self.cursor.pdf_node = p

        parent_list = next(
            self.cursor.ancestors(lambda n: n.node_type == 'list'),
            None,
        )
        if not parent_list:
            logger.warning('Adding list item, but no list parent')
            li.model.marker = '?'
        elif parent_list.pdf_node.is_ordered:
            li.model.marker = f'{li.model.type_emblem}.'
        else:
            li.model.marker = '\u2022'

    def end_list_item(self, p):
        self.cursor_stack.pop()

    def begin_footnote_list(self, fl):
        self.cursor_stack = self.cursor_stack[:1]

    def end_footnote_list(self, fl):
        no_nodes = [key for key, value in self.footnote_citations.items()
                    if not value.footnote_node]
        if no_nodes:
            logger.warning('Unresolved footnote citations exist: %s', no_nodes)
            for no_node_cite in no_nodes:
                del self.footnote_citations[no_node_cite]

    def begin_footnote(self, f):
        child_args = {
            'node_type': 'footnote',
            'marker': str(f.number),
            'type_emblem': str(f.number),
        }
        citation = self.footnote_citations.get(f.number)
        if citation:
            parent = self.cursor.jump_to(citation.doc_node.identifier)
            self.cursor_stack.append(parent.add_child(**child_args))
            citation.footnote_node = self.cursor.model
        else:
            logger.warning('Uncited footnote %s', f.number)
            self.cursor_stack.append(self.cursor.add_child(**child_args))

    def end_footnote(self, f):
        self.cursor_stack.pop()

    def create_footnote_citation(self, cit):
        start = len(self.cursor.text)
        cite_text = str(cit.number)
        self.footnote_citations[cit.number] = FootnoteCitation(
            doc_node=self.cursor.model, start=start, end=start + len(cite_text)
        )
        self.cursor.model.text += cite_text

    def create_text(self, text):
        if not self.cursor.text:
            self.cursor.model.text = text.replace('\n', ' ').lstrip()
        else:
            self.cursor.model.text += text.replace('\n', ' ')
