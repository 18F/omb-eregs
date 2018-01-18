"""omb_eregs URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import include, url

from document.views import editor
from ereqs_admin.admin import admin_site
from reqs.router import router

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^admin/document-editor/(?P<policy_id>[^/]+)$', editor),
    url(r'^admin/', admin_site.urls),
    url(r'^document/', include('document.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    import ombpdf.urls
    urlpatterns.insert(0, url(r'^__debug__/', include(debug_toolbar.urls)))
    urlpatterns.insert(0, url(r'^pdf/', include(ombpdf.urls)))

if settings.MAX_URL:
    from django_cas_ng.views import login as cas_login
    urlpatterns.insert(0, url(r'^admin/login/$', cas_login))
