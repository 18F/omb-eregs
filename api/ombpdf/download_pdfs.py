from pathlib import Path

import requests
from tqdm import tqdm


ROOT_DIR = Path(__file__).parent.parent / 'data'

DOMAIN = "obamawhitehouse.archives.gov"

BASE_URL = f"https://{DOMAIN}/sites/default/files/omb/memoranda/"

# Found at https://obamawhitehouse.archives.gov/omb/memoranda_default.
PDFS = [
    "2011/m11-29.pdf",
    "2016/m_16_19_1.pdf",
    "2017/m-17-02.pdf",
    "2017/m-17-11_0.pdf",
    "2017/m-17-13.pdf",
    "2017/m-17-15.pdf",
    "2015/m-15-17.pdf",
]


def download(relpath, base_url=BASE_URL, domain=DOMAIN):
    url = base_url + relpath
    path = ROOT_DIR / Path(*relpath.split('/'))

    if not path.exists() or path.stat().st_size == 0:
        print(f"Downloading {path} from {domain}...")
        path.parent.mkdir(parents=True, exist_ok=True)
        req = requests.get(url)
        fd = path.open('wb')
        length = int(req.headers['content-length'])

        with tqdm(total=length) as pbar:
            for chunk in req.iter_content(chunk_size=1024):
                fd.write(chunk)
                pbar.update(len(chunk))

    return path


def main():
    for relpath in PDFS:
        download(relpath)
    print(f"Finished downloading PDFs into '{ROOT_DIR}' directory.")
