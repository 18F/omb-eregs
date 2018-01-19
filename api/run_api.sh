#!/bin/bash

./manage.py cf_migrate
if [ -n "$DEBUG" ]; then
  ./manage.py runserver 0.0.0.0:"$PORT"
else
  gunicorn omb_eregs.wsgi:application -b 0.0.0.0:"$PORT" --access-logfile -
fi
