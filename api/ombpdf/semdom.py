from xml.dom import minidom

from . import semtree


class ListInfo:
    def __init__(self, writer, info):
        self.writer = writer
        self.info = info
        self.item = 1

    def begin_list_item(self):
        if self.info.is_ordered:
            attrs = {
                'emblem': str(self.item),
                'marker': f'{self.item}.'
            }
        else:
            attrs = {'marker': '\u2022'}
        self.writer._push_child('listitem', attrs)
        self.writer._push_child('para')
        self.writer._push_child('content', elinfo=self)
        self.item += 1

    def end_list_item(self):
        self.writer._pop_child('content')
        self.writer._pop_child('para')
        self.writer._pop_child('listitem')


class DOMWriter(semtree.Writer):
    def __init__(self):
        # This tracks whether we are outputting any text we're given
        # as actual text nodes (unmuted), or as comment nodes (muted).
        self.muted = True
        self.elinfo = {}
        self.footnote_citations = {}
        self.cursors = []

    @property
    def depth(self):
        node = self.cursor
        depth = 0
        while node != self.root:
            depth += 1
            node = node.parentNode
        return depth

    def _push_cursor(self, cursor):
        self.cursors.append(self.cursor)
        self.cursor = cursor

    def _pop_cursor(self):
        self.cursor = self.cursors.pop()

    def _push_child(self, name, attrs=None, elinfo=None):
        child = self.document.createElement(name)
        if attrs is not None:
            for key, value in attrs.items():
                child.setAttribute(key, value)
        if elinfo is not None:
            self.elinfo[child] = elinfo
        self.cursor.appendChild(child)
        self.cursor = child
        return child

    def _pop_child(self, name=None):
        if name is not None:
            assert self.cursor.nodeName == name
        self.cursor = self.cursor.parentNode

    def _get_parent(self, name):
        node = self.cursor.parentNode
        while node.nodeName != name:
            node = node.parentNode
        return node

    def _ensure_section(self):
        if self.cursor == self.root:
            self._push_child('sec')

    def _add_text(self, text):
        self.cursor.appendChild(self.document.createTextNode(text))

    def _add_comment(self, text):
        self.cursor.appendChild(self.document.createComment(text))

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
        self._push_child('sec')
        self._push_child('heading')
        self.muted = False

    def end_heading(self, heading):
        self._pop_child('heading')
        self.muted = True

    def begin_paragraph(self, p):
        self.muted = False
        self._ensure_section()
        self._push_child('para')
        self._push_child('content')

    def end_paragraph(self, p):
        self._pop_child('content')
        self._pop_child('para')
        self.muted = True

    def begin_list(self, li):
        self._ensure_section()
        self._push_child('list', elinfo=ListInfo(self, li))

    def end_list(self, li):
        self._pop_child('list')

    def begin_list_item(self, p):
        self.elinfo[self.cursor].begin_list_item()
        self.muted = False

    def end_list_item(self, p):
        self.elinfo[self.cursor].end_list_item()
        self.muted = True

    def create_footnote_citation(self, cit):
        self._push_child('footnote_citation')
        self._add_text(str(cit.number))
        self.footnote_citations[cit.number] = self.cursor
        self._pop_child('footnote_citation')

    def begin_footnote_list(self, fl):
        self.muted = True

    def end_footnote_list(self, fl):
        if self.footnote_citations:
            unresolved = str(list(self.footnote_citations.keys()))
            self._add_comment(
                'Warning, unresolved footnote citations exist: '
                f'{unresolved}'
            )
        self.muted = False

    def create_footnote(self, f):
        citation = self.footnote_citations.get(f.number)
        if citation is not None:
            del self.footnote_citations[f.number]
            parent = citation.parentNode
            if parent.nodeName == 'content':
                parent = parent.parentNode
            self._push_cursor(parent)
            self._push_child('footnote', {
                'emblem': str(f.number),
                'marker': str(f.number),
            })
            self._add_text(f.text)
            self._pop_child('footnote')
            self._pop_cursor()
        else:
            self._add_comment(f'Uncited footnote #{f.number}: {f.text}')

    def create_text(self, text):
        text = text.replace('\n', '')
        if self.muted:
            self._add_comment(text)
        else:
            self._add_text(text)
            if self.cursor.nodeName == 'heading':
                sec = self._get_parent('sec')
                sec.setAttribute('title', sec.getAttribute('title') + text)


def to_dom(doc):
    writer = DOMWriter()
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.document
