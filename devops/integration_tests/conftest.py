from collections import namedtuple

import pytest

AppUrls = namedtuple('AppUrls', ('ui', 'api', 'admin'))


@pytest.fixture
def selenium(selenium):
    """Configure selenium"""
    selenium.implicitly_wait(10)
    return selenium


def pytest_addoption(parser):
    parser.addoption('--ui-baseurl', default='http://proxy:9002/',
                     help='base url for the agency UI')
    parser.addoption('--api-baseurl', default='http://proxy:9001/',
                     help='base url for the API')
    parser.addoption('--admin-baseurl', default='http://proxy:9001/admin/',
                     help='base url for the admin')


@pytest.fixture(scope='session')
def app_urls(request):
    return AppUrls(
        request.config.getoption('--ui-baseurl'),
        request.config.getoption('--api-baseurl'),
        request.config.getoption('--admin-baseurl')
    )


@pytest.fixture()
def admin_login(selenium, app_urls):
    selenium.get(app_urls.admin)
    selenium.find_element_by_name('username').send_keys('admin')
    selenium.find_element_by_name('password').send_keys('s3cr37s3cr37')
    selenium.find_element_by_name('password').submit()
