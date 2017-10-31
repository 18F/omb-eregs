from lxml import etree


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
