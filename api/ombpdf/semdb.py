from collections import Counter

from document.serializers import doc_cursor
from document.tree import DocCursor

from . import semtree


class DBWriter(semtree.Writer):
    def __init__(self, policy):
        self.policy = policy
        self.root = DocCursor.new_tree(
            'root', '0', policy=policy, title=policy.title)
        self.cursor = self.root
        self.counter = Counter()
        self.muted = False

    def serialize(self):
        return doc_cursor.DocCursorSerializer(
            self.root, context={'policy': self.policy}).data

    # Below are Writer methods.

    def begin_document(self, doc):
        pass

    def end_document(self, doc):
        self.root.nested_set_renumber()

    def begin_heading(self, heading):
        self.muted = True

    def end_heading(self, heading):
        self.muted = False

    def begin_paragraph(self, p):
        marker = str(self.counter['p'])
        self.cursor = self.cursor.add_child('para', marker)
        self.counter['p'] += 1

    def end_paragraph(self, p):
        self.cursor = self.cursor.parent()

    def begin_list(self, li):
        self.muted = True

    def end_list(self, li):
        self.muted = False

    def begin_list_item(self, p):
        self.muted = True

    def end_list_item(self, p):
        self.muted = False

    def create_footnote_citation(self, cit):
        pass

    def begin_footnote_list(self, fl):
        self.muted = True

    def end_footnote_list(self, fl):
        self.muted = False

    def create_footnote(self, f):
        pass

    def create_text(self, text):
        if self.muted:
            return
        text = text.replace('\n', '')
        self.cursor.model.text += text


def to_db(doc, policy):
    writer = DBWriter(policy)
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer
