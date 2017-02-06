#!/bin/bash

./manage.py migrate --noinput
./manage.py collectstatic --noinput
gunicorn omb_eregs.wsgi:application
