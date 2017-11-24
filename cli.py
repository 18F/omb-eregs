import click

import ombpdf.download_pdfs
import ombpdf.fontsize
import ombpdf.util
import ombpdf.document
import ombpdf.footnotes


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


if __name__ == '__main__':
    cli()
