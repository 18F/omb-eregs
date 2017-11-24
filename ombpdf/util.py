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


def iter_flattened_layout(items, class_filter=object):
    stack = [item for item in items]
    stack.reverse()

    while stack:
        item = stack.pop()
        if isinstance(item, layout.LTContainer):
            children = [child for child in item]
            children.reverse()
            stack.extend(children)
        if isinstance(item, class_filter):
            yield item
