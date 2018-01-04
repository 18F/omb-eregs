FROM python:3.6.2

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

# Note that we want postgresql-client so 'manage.py dbshell' works.
RUN apt-get update && \
  apt-get install -y nodejs postgresql-client

ENV PATH /usr/src/app/api/node_modules/.bin:$PATH
