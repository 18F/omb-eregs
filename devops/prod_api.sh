#!/bin/bash

./manage.py migrate --noinput
./manage.py collectstatic --noinput
./manage.py createinitialrevisions
gunicorn omb_eregs.wsgi:application -b 0.0.0.0:$PORT
