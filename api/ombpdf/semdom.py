from xml.dom import minidom

from . import semtree


class DOMWriter(semtree.Writer):
    def __init__(self):
        self.muted = True
        self.depth = 0

    def _push_child(self, name, attrs=None):
        child = self.document.createElement(name)
        if attrs is not None:
            for key, value in attrs.items():
                child.setAttribute(key, value)
        self.cursor.appendChild(child)
        self.cursor = child
        self.depth += 1
        return child

    def _pop_child(self, name=None):
        if name is not None:
            assert self.cursor.nodeName == name
        self.cursor = self.cursor.parentNode
        self.depth -= 1

    def _get_parent(self, name):
        node = self.cursor.parentNode
        while node.nodeName != name:
            node = node.parentNode
        return node

    # Below are Writer methods.

    def begin_document(self, doc):
        self.document = minidom.parseString('<policy></policy>')
        self.root = self.document.childNodes[0]
        self.cursor = self.root

    def end_document(self, doc):
        pass

    def begin_heading(self, heading):
        while self.depth >= heading.level:
            self._pop_child()
        self._push_child('sec', {'title': ''})
        self._push_child('heading')
        self.muted = False

    def end_heading(self, heading):
        self._pop_child('heading')
        self.muted = True

    def begin_paragraph(self, p):
        self.muted = False
        if self.depth == 0:
            self._push_child('sec')
        self._push_child('para')
        self._push_child('content')

    def end_paragraph(self, p):
        self._pop_child('content')
        self._pop_child('para')
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
            if self.cursor.nodeName == 'heading':
                sec = self._get_parent('sec')
                sec.setAttribute('title', sec.getAttribute('title') + text)
        self.cursor.appendChild(child)


def to_dom(doc):
    writer = DOMWriter()
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.document
