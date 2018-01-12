from typing import NamedTuple, Optional, Tuple

from django import template
from django.template import RequestContext
from django.urls import reverse

register = template.Library()


# Recursive types aren't fully supported by mypy
# https://github.com/python/mypy/issues/731
class MenuItem(NamedTuple):     # type: ignore
    title: str
    active: bool
    url: Optional[str]
    children: Tuple['MenuItem', ...]

    @classmethod
    def new(cls, title, active=False, url=None, children=None):
        return cls(title, active, url, children or ())

    def update_active(self, active_path):
        """Figure out which part of the menu is active. Parents will be active
        if their children are."""
        children = tuple(child.update_active(active_path)
                         for child in self.children)
        child_active = any(child.active for child in children)
        active = self.url == active_path or child_active
        return self._replace(active=active, children=children)

    def append_child(self, child):
        return self._replace(children=self.children + (child,))


menu_archetype = MenuItem.new('', children=(
    MenuItem.new('Policies', children=(
        MenuItem.new('View all policies',
                     url=reverse('admin:reqs_policy_changelist')),
        MenuItem.new('Add new', url=reverse('admin:reqs_policy_add')),
    )),
    MenuItem.new('Users', url=reverse('admin:auth_user_changelist')),
    # Settings depends on the user id, so is added later
))


@register.inclusion_tag('ereqs_admin/nav_menu.html', takes_context=True)
def nav_menu(context: RequestContext):
    active_path = context['request'].path
    user = context['user']
    if user.is_authenticated:
        menu_root = menu_archetype.append_child(MenuItem.new(
            'Settings', url=reverse('admin:auth_user_change', args=(user.pk,))
        ))
        menu_root = menu_root.update_active(active_path)
    else:
        menu_root = MenuItem.new('')

    return {'menu': menu_root.children}
