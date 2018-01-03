from lxml import etree

from document.xml_importer.importer import import_xml_doc

from . import semdom


def to_db(doc, policy):
    dom = semdom.to_dom(doc)
    xml = etree.fromstring(dom.toxml())
    root = import_xml_doc(policy, xml, ignore_preamble=True)
    return root
