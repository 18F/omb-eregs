from unittest.mock import Mock

import pytest

from ereqs_admin.templatetags import nav_menu


def test_nav_menu_requires_authentication():
    context = {
        'request': Mock(),
        'user': Mock(is_authenticated=False),
    }
    assert nav_menu.nav_menu(context) == {'menu': ()}


def test_nav_menu_includes_user_profile():
    context = {
        'request': Mock(),
        'user': Mock(is_authenticated=True, pk=4321),
    }
    menu = nav_menu.nav_menu(context)['menu']
    urls = {m.url for m in menu}
    assert '/admin/auth/user/4321/change/' in urls


def _active_titles(menu):
    if menu.active:
        yield menu.title
    for child in menu.children:
        yield from _active_titles(child)


@pytest.mark.parametrize('active_path,active_titles', (
    ('/child/1', {'root', 'child 1'}),
    ('/child/1/a', {'root', 'child 1', 'subchild a'}),
    ('/child/1/b', {'root', 'child 1', 'subchild b'}),
    ('/child/2', {'root', 'child 2'}),
))
def test_update_active(active_path, active_titles):
    menu = nav_menu.MenuItem.new('root', children=(
        nav_menu.MenuItem.new('child 1', url='/child/1', children=(
            nav_menu.MenuItem.new('subchild a', url='/child/1/a'),
            nav_menu.MenuItem.new('subchild b', url='/child/1/b'),
        )),
        nav_menu.MenuItem.new('child 2', url='/child/2'),
    ))
    menu = menu.update_active(active_path)
    assert set(_active_titles(menu)) == active_titles
