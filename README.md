[![CircleCI](https://circleci.com/gh/18F/omb-pdf.svg?style=svg)](https://circleci.com/gh/18F/omb-pdf)

This repository contains some experimentation with Python's
[pdfminer][] package, to see if it's useful in importing PDFs for
the [OMB Policy Library][].

## Quick start

You'll need Python 3.6 and optionally node JS (to use
some features of the web app).

First, create and activate a virtualenv, e.g.:

```
python3 -m venv venv
source venv/bin/activate
```

Then install requirements:

```
pip install -r requirements.txt
npm install
```

Then run tests:

```
pytest
```

Then download some PDFs:

```
python cli.py download
```

Then run the development web app, which lets you
explore the PDFs and see how our algorithms analyze
them:

```
python cli.py runserver
```

You can visit the app at http://localhost:5000/.

[pdfminer]: https://github.com/pdfminer/pdfminer.six
[OMB Policy Library]: https://github.com/18F/omb-eregs
