from cfenv import AppEnv

from .settings import *     # noqa

DEBUG = False
ALLOWED_HOSTS = ['localhost'] + AppEnv().uris
