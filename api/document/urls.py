from django.conf.urls import url

from document.views import TreeView, editor

urlpatterns = [
    url(r'^editor$', editor),
    url(r'^(?P<policy_id>[^/]+)(/(?P<identifier>[a-zA-Z0-9_-]+))?',
        TreeView.as_view()),
]
