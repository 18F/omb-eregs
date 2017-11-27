from .document import OMBParagraph, OMBFootnote


def cull_footer(page):
    lines = page[:]
    to_remove = []
    for line in reversed(lines):
        if isinstance(line.annotation, OMBFootnote) or line.is_blank():
            to_remove.append(line)
        else:
            break
    for line in to_remove:
        lines.remove(line)
    return lines


def annotate_paragraphs(doc):
    in_paragraph = False
    paragraph_id = 0
    for page in doc.pages:
        for line in cull_footer(page):
            if line.is_blank():
                if in_paragraph:
                    print()
                in_paragraph = False
            elif line.annotation is None:
                first_char = line[0]
                if first_char.fontsize == doc.paragraph_fontsize:
                    if not in_paragraph:
                        in_paragraph = True
                        paragraph_id += 1
                    line.set_annotation(OMBParagraph(paragraph_id))
                    print(str(line).strip())
