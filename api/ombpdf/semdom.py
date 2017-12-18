from xml.dom import minidom

from . import semtree


class DOMWriter(semtree.Writer):
    def __init__(self):
        self.muted = True

    def _push_child(self, name):
        child = self.document.createElement(name)
        self.cursor.appendChild(child)
        self.cursor = child
        return child

    # Below are Writer methods.

    def begin_document(self, doc):
        self.document = minidom.parseString('<policy></policy>')
        self.root = self.document.childNodes[0]
        self.cursor = self.root

    def end_document(self, doc):
        pass

    def begin_heading(self, heading):
        self.muted = True

    def end_heading(self, heading):
        self.muted = False

    def begin_paragraph(self, p):
        self.muted = False
        if self.cursor.nodeName == 'policy':
            self._push_child('sec')
        self._push_child('para')
        self._push_child('content')

    def end_paragraph(self, p):
        self.cursor = self.cursor.parentNode.parentNode
        self.muted = True

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
        text = text.replace('\n', '')
        if self.muted:
            child = self.document.createComment(text)
        else:
            child = self.document.createTextNode(text)
        self.cursor.appendChild(child)


def to_dom(doc):
    writer = DOMWriter()
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.document
