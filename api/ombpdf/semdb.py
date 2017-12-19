from lxml import etree

from document.serializers import doc_cursor
from document.xml_importer.importer import import_xml_doc

from . import semdom


class DBResult:
    def __init__(self, root, policy):
        self.root = root
        self.policy = policy

    def serialize(self):
        return doc_cursor.DocCursorSerializer(
            self.root, context={'policy': self.policy}).data


def to_db(doc, policy):
    dom = semdom.to_dom(doc)
    xml = etree.fromstring(dom.toxml())
    root = import_xml_doc(policy, xml, ignore_preamble=True)
    return DBResult(root, policy)
