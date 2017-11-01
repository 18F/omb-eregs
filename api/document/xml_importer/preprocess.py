import logging

from dateutil import parser as dateutil_parser
from lxml import etree

from reqs.models import Policy

logger = logging.getLogger(__name__)


def standardize_content(xml: etree.ElementBase):
    """For ease of use, we don't require all text be wrapped in a "content"
    tag. However, that idiom _is_ helpful when parsing, so let's add them
    here."""
    for element in xml.xpath('.//*[not(self::content) and not(./content)]'):
        if element.text:
            content_xml = etree.SubElement(element, 'content')
            content_xml.text = element.text
        element.text = None


def clean_content(xml: etree.ElementBase):
    """Remove beginning and trailing whitespace from <content> tags."""
    for content_xml in xml.xpath('.//content'):
        content_xml.text = (content_xml.text or '').lstrip()
        last_child = content_xml.xpath('./*[last()]')
        if last_child:
            last_child = last_child[0]
            last_child.tail = (last_child.tail or '').rstrip()
        else:
            content_xml.text = content_xml.text.rstrip()


def warn_about_mismatches(policy: Policy, xml: etree.ElementBase):
    """When the elements in the document don't match their fields in the XML,
    we warn the user."""
    pairs = [
        (policy.omb_policy_id, cleanup_string(xml, 'policyNum')),
        (policy.title, cleanup_string(xml, 'subject')),
        (policy.issuance, parse_published(xml)),
    ]
    for db_val, xml_val in pairs:
        if db_val != xml_val:
            logger.warning(
                'Mismatch between XML and database. DB says %s, XML %s',
                repr(db_val), repr(xml_val),
            )


def cleanup_string(xml: etree.ElementBase, tag_name: str):
    return (xml.findtext(f".//{tag_name}") or '').strip()


def parse_published(xml: etree.ElementBase):
    published_txt = (xml.findtext('.//published') or '').strip()
    try:
        return dateutil_parser.parse(published_txt).date()
    except ValueError:
        logger.warning('Invalid XML published date: %s', published_txt)
