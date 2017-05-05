def test_policies_tab(selenium, app_urls):
    selenium.get(app_urls.ui + 'requirements')
    link = selenium.find_element_by_link_text('Policies')
    link.click()

    assert selenium.current_url == app_urls.ui + 'policies'


def test_requirements_tab(selenium, app_urls):
    selenium.get(app_urls.ui + 'policies')
    link = selenium.find_element_by_link_text('Requirements')
    link.click()

    assert selenium.current_url == app_urls.ui + 'requirements'


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
    selenium.get(app_urls.ui + 'requirements?page=9999')
    html = selenium.find_element_by_tag_name('html')
    assert 'Server Error' not in html.text
    assert 'Page not found' in html.text
