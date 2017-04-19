def test_ui_loads(selenium, app_urls):
    selenium.get(app_urls.ui)
    reqs_link = selenium.find_element_by_link_text('Requirements')
    reqs_link.click()

    assert 'requirements/by-topic' in selenium.current_url


def test_html_api_loads(selenium, app_urls):
    selenium.get(app_urls.api)
    html = selenium.find_element_by_tag_name('html')
    assert '"topics"' in html.text


def test_admin_loads(selenium, app_urls):
    selenium.get(app_urls.admin)
    form = selenium.find_element_by_tag_name('form')
    assert 'Username' in form.text
    assert 'Password' in form.text


def test_admin_lists_models(selenium, admin_login):
    assert selenium.find_element_by_link_text('Topics') is not None
    assert selenium.find_element_by_link_text('Policies') is not None
    assert selenium.find_element_by_link_text('Requirements') is not None


def test_ui_proxies_404(selenium, app_urls):
    selenium.get(app_urls.ui + 'requirements/by-topic?page=9999')
    html = selenium.find_element_by_tag_name('html')
    assert 'Server Error' not in html.text
    assert 'Page not found' in html.text
