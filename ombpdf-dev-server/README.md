This subdirectory contains a development server for the `ombpdf` package,
which uses Python's [pdfminer][] package to import PDFs for the
[OMB Policy Library][].

## Quick start

Currently, unlike the rest of the OMB Policy Library, this development
server is run outside of Docker.

You'll need Python 3.6 and optionally node JS (to use
some features of the web app).

First, create and activate a virtualenv from the root of this subdirectory,
e.g.:

```
python3 -m venv venv
source venv/bin/activate
```

Then install requirements:

```
pip install -r requirements.txt
npm install
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

## Running tests

The tests are part of the `ombpdf` package itself; you should run them
just as you'd run any of the tests for the other Python packages in the
OMB Policy Library.

[pdfminer]: https://github.com/pdfminer/pdfminer.six
[OMB Policy Library]: https://github.com/18F/omb-eregs
