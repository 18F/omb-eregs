from lxml import etree

from document.xml_importer import preprocess


def test_standardize_content():
    aroot = etree.fromstring("""
    <aroot>
        <childA>More text </childA>
        <childB>
            <content>Already exists</content>
            <innerMost />
        </childB>
        <childC>
            Something else
        </childC>
    </aroot>
    """)
    preprocess.standardize_content(aroot)
    assert aroot.findtext('./childA') == ''
    assert aroot.findtext('./childA/content') == 'More text '
    assert aroot.findtext('./childB/content') == 'Already exists'
    assert aroot.findtext('./childB/innerMost') == ''
    assert aroot.find('./childB/innerMost/content') is None
    assert aroot.findtext('./childC') == ''
    assert aroot.findtext('./childC/content').strip() == 'Something else'


def test_clean_content():
    aroot = etree.fromstring("""
    <aroot>
        <content> Some text <br />   </content>
        <childA>
            <content>
                More    text
            </content>
        </childA>
        <childB />
    </aroot>
    """)
    preprocess.clean_content(aroot)
    assert aroot.findtext('./childA/content') == 'More    text'
    content_xml = etree.tounicode(aroot.find('./content')).strip()
    assert content_xml == '<content>Some text <br/></content>'
