#!/bin/bash

./manage.py migrate --noinput
if [ -n "$DEBUG" ]; then
  ./manage.py runserver 0.0.0.0:$PORT
else
  ./manage.py collectstatic --noinput
  gunicorn omb_eregs.wsgi:application -b 0.0.0.0:$PORT --access-logfile -
fi
