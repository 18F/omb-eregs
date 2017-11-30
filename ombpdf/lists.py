import re

from .document import OMBListItem, OMBListItemMarker


UL_RE = re.compile(r'^• ')

OL_RE = re.compile(r'^([0-9]+|[A-Za-z])\. ')

TYPE_UL = 'unordered list'

TYPE_OL = 'ordered list'


def get_list_item_type(line):
    text = str(line)

    ul_match = UL_RE.match(text)
    if ul_match:
        return TYPE_UL, ul_match

    ol_match = OL_RE.match(text)
    if ol_match:
        return TYPE_OL, ol_match

    return None, None


class ListInfo:
    def __init__(self, list_id, left_edge, is_ordered):
        self.id = list_id
        self.left_edge = left_edge
        self.item_number = 1
        self.is_ordered = is_ordered


def annotate_lists(doc):
    list_id = 0
    stack = []
    lists = {}
    for page in doc.pages:
        for line in page:
            left_edge = stack[-1].left_edge if stack else doc.left_edge
            li_type, marker_match = get_list_item_type(line)
            is_ordered = li_type == TYPE_OL
            li_found = False
            if line.left_edge > left_edge and li_type is not None:
                list_id += 1
                stack.append(ListInfo(list_id, line.left_edge, is_ordered))
                lists[list_id] = {}
                li_found = True
            elif line.left_edge < left_edge:
                stack.pop()
            elif (line.left_edge == left_edge and
                  li_type is not None and stack):
                stack[-1].item_number += 1
                li_found = True
            if li_found:
                for char in line.iter_match(marker_match):
                    char.set_annotation(OMBListItemMarker(is_ordered))
            if stack and not line.is_blank():
                li = stack[-1]
                line.set_annotation(OMBListItem(
                    list_id=li.id,
                    number=li.item_number,
                    is_ordered=li.is_ordered,
                    indentation=len(stack),
                ))
                if li.item_number not in lists[li.id]:
                    lists[li.id][li.item_number] = []
                lists[li.id][li.item_number].append(line)
    return lists
