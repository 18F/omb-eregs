[![CircleCI](https://circleci.com/gh/18F/omb-pdf.svg?style=svg)](https://circleci.com/gh/18F/omb-pdf)

This repository contains some experimentation with Python's
[pdfminer][] package, to see if it's useful in importing PDFs for
the [OMB Policy Library][].

## Quick start

You'll need Python 3.6.

First, create and activate a virtualenv, e.g.:

```
python3 -m venv venv
source venv/bin/activate
```

Then install requirements:

```
pip install -r requirements.txt
```

Then run tests:

```
pytest
```

Then run the CLI:

```
python cli.py --help
```

[pdfminer]: https://github.com/pdfminer/pdfminer.six
[OMB Policy Library]: https://github.com/18F/omb-eregs
