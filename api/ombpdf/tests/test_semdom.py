from pathlib import Path

from ombpdf.semdom import to_dom

from .snapshot import assert_snapshot_matches

MY_DIR = Path(__file__).parent


def assert_dom_xml_snapshot_matches(doc, force_overwrite=False):
    dom = to_dom(doc)
    xml = dom.toprettyxml(indent='  ')
    name = Path(doc.filename).stem
    expected_xml_path = MY_DIR / f'test_semdom.snapshot.{name}.xml'

    assert_snapshot_matches(expected_xml_path, xml, 'DOM XML',
                            force_overwrite=force_overwrite)


def test_m_14_10_import(m_14_10_doc):
    assert_dom_xml_snapshot_matches(m_14_10_doc)


def test_m_16_19_import(m_16_19_doc):
    assert_dom_xml_snapshot_matches(m_16_19_doc)
