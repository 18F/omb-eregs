from pdfminer import converter, pdfinterp, layout
from pdfminer.pdfpage import PDFPage


def get_ltpages(infile, caching=True):
    rm = pdfinterp.PDFResourceManager(caching=caching)
    laparams = layout.LAParams(detect_vertical=False)
    device = converter.PDFPageAggregator(rm, laparams=laparams)
    interpreter = pdfinterp.PDFPageInterpreter(rm, device)
    ltpages = []
    for page in PDFPage.get_pages(infile, caching=caching):
        interpreter.process_page(page)
        ltpages.append(device.get_result())
    device.close()
    return ltpages


def iter_flattened_layout(ltpages):
    stack = ltpages[:]
    stack.reverse()

    while stack:
        item = stack.pop()
        if isinstance(item, layout.LTContainer):
            for child in item:
                stack.append(child)
        yield item
