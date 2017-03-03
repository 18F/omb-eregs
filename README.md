# OMB eRegulations
This repository contains code necessary to run the White House Office of Management and Budget (OMB) instance of
[eRegulations](https://eregs.github.io) (a regulation parser, API, and viewer). 

See our bi-weekly demos [on
YouTube](https://www.youtube.com/playlist?list=PLd9b-GuOJ3nEJsDD5BZ5qlVkr9RZ0PivQ).

## Status
[![Build Status](https://travis-ci.org/18F/omb-eregs.svg?branch=master)](https://travis-ci.org/18F/omb-eregs)
[![Code Climate](https://codeclimate.com/github/18F/omb-eregs/badges/gpa.svg)](https://codeclimate.com/github/18F/omb-eregs)

## Running

### Requirements

We recommend using
[Docker](https://www.docker.com/products/overview#install_the_platform), an
open source container engine. If you haven't already please install Docker and
[Docker-compose](https://docs.docker.com/compose/install/) (which is installed
automatically with Docker on Windows and OS X).

### Admin/API

Let's start by adding an admin user.

```bash
docker-compose run --rm manage.py migrate  # set up database
docker-compose run --rm manage.py createsuperuser
# [fill out information]
docker-compose up prod-api
# Ctrl-c to kill
```

Then navigate to http://localhost:8001/admin/ and log in.

### UI

We can also start the UI server (which runs NodeJS) via:

```bash
docker-compose up dev
# Ctrl-c to kill
```

Then navigate to http://localhost:8000/

This runs in development mode (including automatic JS recompilation). To run
in prod mode, run

```bash
docker-compose run --rm webpack  # to build the server JS
docker-compose up prod
```

### Data

Let's also load the requirements data from OMB:

```bash
docker-compose run --rm manage.py fetch_csv
docker-compose run --rm manage.py import_reqs data.csv
```

This may emit some warnings for improper input. The next time you visit the
admin, you'll see it's populated.

### Docker-compose commands

There are two types of entry points:

1. Services which will run until you press `ctrl-c`. These are activated via
  `docker-compose up`
  * `prod-api` - Build the admin/API app and run it in "production" mode on
    port 8001
  * `dev-api` - Build the admin/API app and run it in "development" mode on
    port 8001
  * `dev` - Build and run the UI and API app in "development" mode (port 8000
    for UI, 8001 for API).
  * `prod` - Run the UI and API apps in "production" mode (port 8000 for UI,
    8001 for API). Note that this requires the JS be compiled already.
1. One use commands which run until complete. These are ran via
  `docker-compose run --rm` (the `--rm` just deletes the images after running;
  it's not strictly required)
  * `manage.py`
  * `py.test`
  * `flake8`
  * `pip-compile`
  * `npm`
  * `webpack`
  * `psql`

### Resolving common container issues

If a Javascript dependency has been added (indicated by an error within
`node_modules`), run
```sh
docker-compose run --rm npm install
```

If a Python dependency has been added, run
```sh
docker-compose build  # rebuilds images, which include Python libs
```

If you see an error about a conflicting port, try spinning down the running
services
```sh
docker-compose down
```

If all it lost and you want to start from scratch, run
```sh
docker-compose down
docker volume rm omberegs_database_data   # remove database data
docker-compose build
```

## API Endpoints

We provide access to JSON-serialized versions of each of our data types via a
RESTful API. This data can be filtered using a Django queryset-like syntax
(see [Django Filters](https://django-filter.readthedocs.io/en/latest/)).
Notably, one can query on related fields and using Django-style lookups like
`__in` and `__range`. For example, to query for requirements which match a
certain set of keywords, use:

```
https://.../requirements/?keywords__name__in=Keyword1,Keyword2,Keyword3
```

See our [list of endpoints](reqs/router.py) and [available
filters](reqs/views.py).

## Documentation and contributing

See the [eRegulations overview](https://eregs.github.io/) for context about eRegulations, which is a multi-agency project.

To learn how to set up OMB eRegulations (locally or in production) and customize it/develop for it, see [the documentation hosted on Read the Docs](https://readthedocs.org/projects/omb-eregs/).

If you're interested in contributing to OMB eRegulations, see [the contributing guidelines](CONTRIBUTING.md).

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
