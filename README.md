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
This project assumes Python 3.5. Perhaps the easiest way to get this installed
is through [pyenv](https://github.com/yyuu/pyenv):

```bash
curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/master/bin/pyenv-installer | bash
pyenv update
pyenv install 3.5.3
pyenv shell 3.5.3   # will need to run this when opening a new shell, too
```

Once you have Python set up, you'll want to install the project's developer
requirements:

```bash
pip install -r requirements_dev.txt
```

We use [`pip-tools`](https://github.com/nvie/pip-tools) to pin our
dependencies. If adding a new requirement, you'll want to modify
`requirements.in`, then run:

```bash
pip install pip-tools   # if you haven't already
pip-compile --output-file requirements.txt requirements.in
pip-compile --output-file requirements_dev.txt requirements_dev.in
pip-sync requirements_dev.txt
```

### Admin

Now that you have the libraries installed, let's run the admin.

```bash
python manage.py migrate    # updates a local (sqlite) database
python manage.py createsuperuser
python manage.py runserver
```

Then navigate to http://localhost:8000/admin/ and log in.

### Data

Let's also load the requirements data from OMB:

```bash
# Download the CSV
wget https://github.com/ombegov/policy-v2/raw/master/assets/Phase1_CombinedQA_AllPhase1_Nov21.csv
# Convert it to UTF-8
iconv -f Windows-1252 -t utf-8 Phase1_CombinedQA_AllPhase1_Nov21.csv > data.csv
python manage.py import_reqs data.csv
```

This may emit some warnings for improper input. The next time you visit the
admin, you'll see it's populated.

## Documentation and contributing

See the [eRegulations overview](https://eregs.github.io/) for context about eRegulations, which is a multi-agency project.

To learn how to set up OMB eRegulations (locally or in production) and customize it/develop for it, see [the documentation hosted on Read the Docs](https://readthedocs.org/projects/omb-eregs/).

If you're interested in contributing to OMB eRegulations, see [the contributing guidelines](CONTRIBUTING.md).

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
