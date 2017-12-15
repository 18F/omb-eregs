from collections import namedtuple

import lxml.etree as ET

from . import semtree

StackItem = namedtuple('StackItem', ['el', 'level'])


class DBWriter(semtree.Writer):
    def __init__(self):
        self.root = ET.Element('policy')
        self.stack = [StackItem(self.root, 0)]

    def getvalue(self):
        return ET.tostring(self.root, encoding="unicode", pretty_print=True)

    def _push(self, el, level=None):
        if level is None:
            level = self.stack[-1].level
        self.stack.append(StackItem(el, level))

    # Below are Writer methods.

    def begin_document(self, doc):
        self.preamble = ET.SubElement(self.root, 'preamble')
        self.policyTitle = ET.SubElement(self.preamble, 'policyTitle')
        self.policyTitle.text = doc.title

    def end_document(self, doc):
        pass

    def begin_heading(self, heading):
        while True:
            if self.stack[-1].level >= heading.level:
                self.stack.pop()
            else:
                break
        el = ET.SubElement(self.stack[-1].el, 'sec')
        el.attrib['title'] = ''
        heading_el = ET.SubElement(el, 'heading')
        heading_el.text = ''
        self._push(el, heading.level)
        self._push(heading_el)

    def end_heading(self, heading):
        self.stack.pop()

    def begin_paragraph(self, p):
        pass

    def end_paragraph(self, p):
        pass

    def begin_list(self, li):
        pass

    def end_list(self, li):
        pass

    def begin_list_item(self, p):
        pass

    def end_list_item(self, p):
        pass

    def create_footnote_citation(self, cit):
        pass

    def begin_footnote_list(self, fl):
        pass

    def end_footnote_list(self, fl):
        pass

    def create_footnote(self, f):
        pass

    def create_text(self, text):
        text = text.replace('\n', '')
        if self.stack[-1].el.tag == 'heading':
            self.stack[-2].el.attrib['title'] += text
            self.stack[-1].el.text += text


def to_db(doc):
    writer = DBWriter()
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()
