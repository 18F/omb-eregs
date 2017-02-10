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

### Admin

Let's start by adding an admin user.

```bash
docker-compose run manage.py createsuperuser
# fill out information
docker-compose up prod
# Ctrl-c to kill
```

Then navigate to http://localhost:8000/admin/ and log in.

### Data

Let's also load the requirements data from OMB:

```bash
docker-compose run manage.py fetch_csv
docker-compose run manage.py import_reqs data.csv
```

This may emit some warnings for improper input. The next time you visit the
admin, you'll see it's populated.

### Docker-compose commands

There are two types of entry points:

1. Services which will run until you press `ctrl-c`. These are activated via
  `docker-compose up`
  * `prod` - Build the app and run it in "production" mode on port 8000
  * `dev` - Build the app and run it in "development" mode on port 8000
1. One use commands which run until complete. These are ran via
  `docker-compose run`
  * `manage.py`
  * `py.test`
  * `flake8`
  * `pip-compile`
  * `npm`
  * `webpack`

## Documentation and contributing

See the [eRegulations overview](https://eregs.github.io/) for context about eRegulations, which is a multi-agency project.

To learn how to set up OMB eRegulations (locally or in production) and customize it/develop for it, see [the documentation hosted on Read the Docs](https://readthedocs.org/projects/omb-eregs/).

If you're interested in contributing to OMB eRegulations, see [the contributing guidelines](CONTRIBUTING.md).

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
