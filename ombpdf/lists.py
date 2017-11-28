import re

from .document import OMBListItem


UL_RE = re.compile(r'^• ')

OL_RE = re.compile(r'^([0-9]+|[A-Za-z])\. ')

TYPE_UL = 'unordered list'

TYPE_OL = 'ordered list'


def get_list_item_type(line):
    text = str(line)
    if UL_RE.match(text):
        return TYPE_UL
    if OL_RE.match(text):
        return TYPE_OL
    return None


class ListInfo:
    def __init__(self, list_id, left_edge, is_ordered):
        self.id = list_id
        self.left_edge = left_edge
        self.item_number = 1
        self.is_ordered = is_ordered


def annotate_lists(doc):
    list_id = 0
    stack = []
    lines = []
    for page in doc.pages:
        for line in page:
            left_edge = stack[-1].left_edge if stack else doc.left_edge
            li_type = get_list_item_type(line)
            if line.left_edge > left_edge and li_type is not None:
                list_id += 1
                stack.append(ListInfo(list_id, line.left_edge, 
                                      is_ordered=(li_type == TYPE_OL)))
            elif line.left_edge < left_edge:
                stack.pop()
            elif (line.left_edge == left_edge and
                  li_type is not None and stack):
                stack[-1].item_number += 1
            if stack and not line.is_blank():
                li = stack[-1]
                line.set_annotation(OMBListItem(
                    list_id=li.id,
                    number=li.item_number,
                    is_ordered=li.is_ordered,
                    indentation=len(stack),
                ))
                lines.append(line)
    return lines


def main(doc):
    lines = annotate_lists(doc)
    for line in lines:
        print(f'{line.annotation} {str(line)}')
