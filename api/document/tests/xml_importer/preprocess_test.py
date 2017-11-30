from datetime import date
from unittest.mock import Mock

import pytest
from lxml import etree
from model_mommy import mommy

from document.xml_importer import preprocess
from reqs.models import Policy


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


def test_standardize_content_inlines():
    """Ensure that we don't mess up inline elements."""
    aroot = etree.fromstring("""
    <aroot>
        <childA>
            <content>Some <em>things</em> here</content>
        </childA>
    </aroot>
    """)
    preprocess.standardize_content(aroot)
    assert aroot.findtext('./childA/content/em') == 'things'
    assert aroot.find('./childA/content/em/content') is None


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


@pytest.mark.parametrize('diff_policy_num', (False, True))
@pytest.mark.parametrize('diff_title', (False, True))
@pytest.mark.parametrize('diff_published', (False, True))
def test_warn_about_mismatches(monkeypatch, diff_policy_num, diff_title,
                               diff_published):
    monkeypatch.setattr(preprocess, 'logger', Mock())
    policy = mommy.prepare(Policy, omb_policy_id='M-11', title='AAA',
                           issuance=date(2001, 1, 1))
    policy_num = 'N-22' if diff_policy_num else 'M-11'
    title = 'BBB' if diff_title else 'AAA'
    published = date(2002, 2, 2) if diff_published else date(2001, 1, 1)
    xml = etree.fromstring(f"""
    <root>
        <preamble>
            <policyNum> {policy_num}</policyNum>
            <subject>{title} </subject>
            <published> {published.isoformat()} </published>
        </preamble>
    </root>
    """)

    preprocess.warn_about_mismatches(policy, xml)
    mismatch_count = sum((diff_policy_num, diff_title, diff_published))
    assert preprocess.logger.warning.call_count == mismatch_count
