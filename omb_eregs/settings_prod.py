from cfenv import AppEnv

from .settings import *     # noqa

DEBUG = False
ALLOWED_HOSTS = ['localhost', '0.0.0.0', '127.0.0.1'] + AppEnv().uris
