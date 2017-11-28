import sys

import click

import ombpdf.download_pdfs
import ombpdf.fontsize
import ombpdf.util
import ombpdf.document
import ombpdf.footnotes
import ombpdf.underlines
import ombpdf.html
import ombpdf.pagenumbers


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
def html(filename):
    "Convert the given PDF to HTML."

    content = ombpdf.html.to_html(get_doc(filename)).encode('utf-8')
    sys.stdout.buffer.write(content)


if __name__ == '__main__':
    cli()
