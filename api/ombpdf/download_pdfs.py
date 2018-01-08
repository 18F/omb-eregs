import logging
from io import BytesIO
from pathlib import Path
from typing import BinaryIO, Optional, cast

import requests
from tqdm import tqdm

ROOT_DIR = Path(__file__).parent.parent / 'data'

DOMAIN = "obamawhitehouse.archives.gov"

BASE_URL = f"https://{DOMAIN}/sites/default/files/omb/memoranda/"

# Found at https://obamawhitehouse.archives.gov/omb/memoranda_default.
PDFS = [
    "2011/m11-29.pdf",
    "2014/m-14-10.pdf",
    "2015/m-15-17.pdf",
    "2016/m_16_19_1.pdf",
    "2017/m-17-02.pdf",
    "2017/m-17-11_0.pdf",
    "2017/m-17-13.pdf",
    "2017/m-17-15.pdf",
]

logger = logging.getLogger(__name__)


def download(relpath, base_url=BASE_URL, domain=DOMAIN):
    url = base_url + relpath
    path = ROOT_DIR / Path(*relpath.split('/'))

    if not path.exists() or path.stat().st_size == 0:
        print(f"Downloading {path} from {domain}...")
        path.parent.mkdir(parents=True, exist_ok=True)
        output_file = cast(BinaryIO, path.open('wb'))
        download_with_progress(url, output_file)

    return path


def safe_content_length(response: requests.Response) -> int:
    """Account for missing or malformed content-length data."""
    length = response.headers.get('content-length', '0')
    if not length.isdigit():
        length = '0'
    return int(length)


def download_with_progress(url, write_to: Optional[BinaryIO]=None) -> BinaryIO:
    if write_to is None:
        write_to = BytesIO()

    logger.info('Retrieving %s', url)

    with requests.get(url, stream=True) as response:
        length = safe_content_length(response)
        with tqdm(total=length) as pbar:
            for chunk in response.iter_content(chunk_size=1024):
                write_to.write(chunk)
                pbar.update(len(chunk))

    return write_to


def main():
    for relpath in PDFS:
        download(relpath)
    print(f"Finished downloading PDFs into '{ROOT_DIR}' directory.")
