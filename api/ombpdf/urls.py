from django.conf.urls import url

from ombpdf import views

PDF = r'(?P<pdf>[0-9A-Za-z\/_\-]+\.pdf)'

urlpatterns = [
    url(r'^$', views.index, name='ombpdf_index'),
    url(f'^raw/{PDF}$', views.raw_pdf, name='raw_pdf'),
    url(f'^html/{PDF}$', views.html_pdf, name='html_pdf'),
    url(f'^rawlayout/{PDF}$', views.rawlayout_pdf, name='rawlayout_pdf'),
    url(f'^semhtml/{PDF}$', views.semhtml_pdf, name='semhtml_pdf'),
]
