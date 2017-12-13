from collections import namedtuple

import lxml.etree as ET

from . import semtree


Section = namedtuple('Section', ['el', 'heading_el', 'level'])


class XMLWriter(semtree.Writer):
    def __init__(self):
        self.root = ET.Element('policy')
        self.sections = []
        self.in_heading = False

    def getvalue(self):
        return ET.tostring(self.root, encoding="unicode", pretty_print=True)

    # Below are Writer methods.

    def begin_document(self, doc):
        self.preamble = ET.SubElement(self.root, 'preamble')
        self.policyTitle = ET.SubElement(self.preamble, 'policyTitle')
        self.policyTitle.text = doc.title

    def end_document(self, doc):
        pass

    def begin_heading(self, heading):
        if self.sections:
            while self.sections:
                if self.sections[-1].level >= heading.level:
                    self.sections.pop()
                else:
                    break
        if self.sections:
            parent = self.sections[-1].el
        else:
            parent = self.root
        el = ET.SubElement(parent, 'sec')
        el.attrib['title'] = ''
        heading_el = ET.SubElement(el, 'heading')
        heading_el.text = ''
        self.sections.append(Section(el, heading_el, heading.level))
        self.in_heading = True

    def end_heading(self, heading):
        self.in_heading = False

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
        if self.in_heading:
            self.sections[-1].el.attrib['title'] += text
            self.sections[-1].heading_el.text += text


def to_xml(doc):
    writer = XMLWriter()
    builder = semtree.SemanticTreeBuilder(doc, writer)

    builder.build()

    return writer.getvalue()
