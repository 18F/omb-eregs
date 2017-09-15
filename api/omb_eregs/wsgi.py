"""
WSGI config for omb_eregs project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os

import newrelic.agent
from cfenv import AppEnv
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "omb_eregs.settings")

env = AppEnv()
app_name = os.environ.get('NEW_RELIC_APP_NAME')
license_key = env.get_credential('NEW_RELIC_LICENSE_KEY')

if app_name and license:
    nr_settings = newrelic.agent.global_settings()
    nr_settings.app_name = app_name
    nr_settings.license_key = license_key
    newrelic.agent.initialize()

application = get_wsgi_application()
