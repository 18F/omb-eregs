import os
import sys
import subprocess

import click

import ombpdf.download_pdfs
import ombpdf.fontsize
import ombpdf.util
import ombpdf.document
import ombpdf.footnotes
import ombpdf.underlines
import ombpdf.html
import ombpdf.pagenumbers
import ombpdf.headings
import ombpdf.semhtml
import ombpdf.webapp
import ombpdf.rawlayout


def get_doc(filename):
    with open(filename, 'rb') as infile:
        return ombpdf.document.OMBDocument.from_file(infile)


def get_ltpages(filename):
    with open(filename, 'rb') as infile:
        return ombpdf.util.get_ltpages(infile)


@click.group()
def cli():
    pass


@cli.command()
def download():
    "Download a bunch of OMB PDFs."

    ombpdf.download_pdfs.main()


@cli.command()
@click.argument('filename')
def fonts(filename):
    "Show font usage statistics for a PDF."

    ombpdf.fontsize.main(get_ltpages(filename))


@cli.command()
@click.argument('filename')
def footnotes(filename):
    "Show footnote details for a PDF."

    ombpdf.footnotes.main(get_doc(filename))


@cli.command()
@click.argument('filename')
def underlines(filename):
    "Show underlined words in a PDF."

    ombpdf.underlines.main(get_doc(filename))


@cli.command()
@click.argument('filename')
def pagenumbers(filename):
    "Show page numbers in a PDF."

    ombpdf.pagenumbers.main(get_doc(filename))


@cli.command()
@click.argument('filename')
def headings(filename):
    "Show headings in a PDF."

    ombpdf.headings.main(get_doc(filename))


@cli.command()
@click.argument('filename')
def html(filename):
    "Convert the given PDF to HTML."

    content = ombpdf.html.to_html(get_doc(filename)).encode('utf-8')
    sys.stdout.buffer.write(content)


@cli.command()
@click.argument('filename')
def semhtml(filename):
    "Convert the given PDF to semantic HTML."

    content = ombpdf.semhtml.to_html(get_doc(filename)).encode('utf-8')
    sys.stdout.buffer.write(content)


@cli.command()
@click.argument('filename')
def rawlayout(filename):
    "Show HTML for the raw layout (bounding boxes, etc) of the given PDF."

    content = ombpdf.rawlayout.to_html(get_doc(filename)).encode('utf-8')
    sys.stdout.buffer.write(content)


@cli.command()
def runserver():
    "Run a web server that lets you browse PDFs and their conversions."

    env = {}
    env.update(os.environ)
    env.update({
        'FLASK_APP': os.path.join('ombpdf', 'webapp', '__init__.py'),
        'FLASK_DEBUG': '1',
    })

    popen = subprocess.Popen(['flask', 'run'], env=env)
    popen.wait()


if __name__ == '__main__':
    cli()
