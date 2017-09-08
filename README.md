# OMB eRequirements
This repository contains a tool to make White House Office of Management and Budget (OMB) policy requirements easier to view, comply with, and maintain.

The repository contains a Django application where requirements are maintained by the OMB team. The Django application also serves an API. The repo also contains an agency- and public-facing tool to view and filter the requirements, and see related information about them. The public-facing tool is comprised of an isomorphic Node and React application.

Brought to you by the 18F [eRegulations](https://eregs.github.io) team. 

See our bi-weekly demos [on
YouTube](https://www.youtube.com/playlist?list=PLd9b-GuOJ3nEJsDD5BZ5qlVkr9RZ0PivQ).

## Status

[![CircleCI](https://circleci.com/gh/18F/omb-eregs.svg?style=svg)](https://circleci.com/gh/18F/omb-eregs)
[![Code Climate](https://codeclimate.com/github/18F/omb-eregs/badges/gpa.svg)](https://codeclimate.com/github/18F/omb-eregs)
[![Dependency Status](https://gemnasium.com/badges/github.com/18F/omb-eregs.svg)](https://gemnasium.com/github.com/18F/omb-eregs)


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
docker-compose up dev-api
# Ctrl-c to kill
```

Then navigate to http://localhost:8001/admin/ and log in.

### UI

We can also start the UI server (which runs NodeJS) via:

```bash
docker-compose up dev
# Ctrl-c to kill
```

Then navigate to http://localhost:8002/

This runs in development mode (including automatic JS recompilation). To run
in prod mode, run

```bash
docker-compose run --rm webpack  # to build the server JS
docker-compose up prod
```

Then navigate to http://localhost:9002/ (prod and dev run on separate ports).

### Data

Let's also load the requirements and agency data from OMB:

```bash
docker-compose run --rm manage.py fetch_csv
docker-compose run --rm manage.py import_reqs data.csv
docker-compose run --rm manage.py sync_agencies
```

This may emit some warnings for improper input. The next time you visit the
admin, you'll see it's populated.

### Docker-compose commands

There are two types of entry points:

1. Services which will run until you press `ctrl-c`. These are activated via
  `docker-compose up`
  * `prod-api` - Build the admin/API app and run it in "production" mode on
    port 9001
  * `dev-api` - Build the admin/API app and run it in "development" mode on
    port 8001
  * `dev` - Build and run the UI and API app in "development" mode (port 8002
    for UI, 8001 for API).
  * `prod` - Run the UI and API apps in "production" mode (port 9002 for UI,
    9001 for API). Note that this requires the JS be compiled already.
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

If you see an error about a conflicting port, try spinning down the running
services (including those associated with integration tests).
```sh
docker-compose down
docker-compose -p integration_tests down
```

If all it lost and you want to start from scratch, run
```sh
docker-compose down -v      # also removes database data
docker-compose -p integration_tests down -v
```

### Running w/ Credentials

Generally, we don't need to set up local development with authentication
credentials. To exercise that workflow, however, you can edit the
docker-compose.yml file. Hop to the `dev` or `prod` key (whichever environment
you plan to run) and inside the `VCAP_SERVICES` key, you'll see an empty JS
object next to `UI_BASIC_AUTH`. Insert your username and password to this
object (keyed by username) to test out authentication.

For example (skipping all irrelevant keys)
```yml
services:
  dev:
    environment:
      VCAP_SERVICES: >
        {"config": [{"name": "config", "credentials": {"UI_BASIC_AUTH": {
          "myusername": "mypassword",
          "myothername": "itspassword"
        }}}]}
```

### Running w/ MAX Authentication

In production, we always run with [MAX](https://max.gov/) authentication, but
for local development, we've opted for Django's password-based authentication.
If you would prefer to test MAX authentication, uncomment the appropriate
environment variable in docker-compose.yml:

```yml
services:
  dev-api:
    environment:
      MAX_URL: https://example.com/etc
```

### Data Migrations

We aim to store a history of changes to requirements, agencies, etc. etc. as a
safety against accidental data loss.
[`Django-reversion`](https://django-reversion.readthedocs.io) handles these
changes made in the admin and offers partial solutions for data changes
outside of that context. We must be careful to always wrap creation, deletion,
and updates to data within its `create_revision` block, lest we have no
history of the new data. Relatedly, we must not use backwards references (e.g.
a `blog_set` field on `authors`) when updating data as that won't get
serialized.

When we create database migrations, we *may* want to create a revision of all
affected models. This is necessary when moving data from one field to another
or transforming data in place. To do this, we can specify a `REVISED_MODELS`
field on our migration and set it to contain a sequence of pairs of
`app_label`, `model_name`. After all migrations are run, Django will check
which (if any) models need revisions generated. See
`reqs/migrations/0040_auto_20170616_1501.py` for an example.

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

## Testing

We have unit tests for the API/admin (Python) and for the React-based frontend
(JS), which are executed in different ways.

For Python unit tests, run:
```sh
docker-compose run --rm py.test
docker-compose run --rm flake8  # linting
```

For JS unit tests, run:
```sh
docker-compose run --rm npm test
docker-compose run --rm webpack       # lints (and builds)
```

We also have a suite of integration tests, which are relatively complicated to
set up, so we've wrapped them in a script:
```sh
./devops/integration-tests.sh
```
If your environment does not have a bash-like shell, inspect that file to
implement something similar.

See our `.circleci/config.yml` for a list of the exact commands we run in CI.

## Deploying

We deploy to our dev/demo environment via CircleCI after every merge to master.
To deploy manually (or to prod), you will need to install the `cf` command
line tool and an associated plugin:

1. [Install/setup `cf` for
    cloud.gov](https://cloud.gov/docs/getting-started/setup/#set-up-the-command-line)
    (our Org name is `omb-eregs`)
1. [Install the autopilot
    plugin](https://github.com/contraband/autopilot#installation)

Then, make sure you've built the frontend:

```sh
docker-compose run --rm webpack
```

And deploy!

```sh
./devops/deploy.sh dev  # replace "dev" with "prod" if desired
```

## System diagram
![System diagram](https://cloud.githubusercontent.com/assets/326918/25196365/6e84c9cc-250e-11e7-96ac-aa9657997a3d.png)

## Documentation and contributing

See the [eRegulations overview](https://eregs.github.io/) for context about eRegulations, which is a multi-agency project.

To learn how to set up OMB eRegulations (locally or in production) and customize it/develop for it, see [the documentation hosted on Read the Docs](https://readthedocs.org/projects/omb-eregs/).

If you're interested in contributing to OMB eRegulations, see [the contributing guidelines](CONTRIBUTING.md).

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
