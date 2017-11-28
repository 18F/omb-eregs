import re


UL_RE = re.compile(r'^• ')

OL_RE = re.compile(r'^([0-9]+|[A-Za-z])\. ')


def is_list_item(line):
    text = str(line)
    return UL_RE.match(text) or OL_RE.match(text)


class ListInfo:
    def __init__(self, list_id, left_edge):
        self.id = list_id
        self.left_edge = left_edge
        self.item_number = 1


def annotate_lists(doc):
    list_id = 0
    stack = []
    for page in doc.pages:
        for line in page:
            left_edge = stack[-1].left_edge if stack else doc.left_edge
            if line.left_edge > left_edge and is_list_item(line):
                list_id += 1
                stack.append(ListInfo(list_id, line.left_edge))
            elif line.left_edge < left_edge:
                stack.pop()
            elif line.left_edge == left_edge and is_list_item(line) and stack:
                stack[-1].item_number += 1
            if stack:
                print(f'indent {len(stack)} list #{stack[-1].id} '
                      f'item #{stack[-1].item_number}: {str(line)}')


def main(doc):
    lists = annotate_lists(doc)
