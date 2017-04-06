def test_ui_loads(selenium):
    selenium.get('http://prod:9000/')
    reqs_link = selenium.find_element_by_link_text('Requirements')
    reqs_link.click()

    assert 'requirements/by-keyword' in selenium.current_url


def test_html_api_loads(selenium):
    selenium.get('http://prod-api:9001/')
    html = selenium.find_element_by_tag_name('html')
    assert '"keywords"' in html.text
