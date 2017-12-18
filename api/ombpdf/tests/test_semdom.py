from pathlib import Path

from ombpdf.semdom import to_dom

from .snapshot import assert_snapshot_matches

MY_DIR = Path(__file__).parent


def assert_dom_xml_snapshot_matches(doc):
    dom = to_dom(doc)
    xml = dom.toprettyxml(indent='  ')
    name = Path(doc.filename).stem
    expected_xml_path = MY_DIR / f'test_semdom.snapshot.{name}.xml'

    assert_snapshot_matches(expected_xml_path, xml, 'DOM XML')


def test_m_14_10_import(m_14_10_doc):
    assert_dom_xml_snapshot_matches(m_14_10_doc)
