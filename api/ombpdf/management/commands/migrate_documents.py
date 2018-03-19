import logging

from django.core.management.base import BaseCommand
from django.db import transaction
from tqdm import tqdm

from document.models import DocNode
from document.tree import DocCursor

logger = logging.getLogger(__name__)


def ensure_listitem_in_list(doc: DocCursor) -> DocCursor:
    """We expect all listitems to have a parent list. However, the parser has
    emitted lists followed by bare listitems. We'll place the listitem in the
    list that imemdiately precedes it."""
    for li in doc.filter(lambda n: n.node_type == 'listitem'):
        parent = li.parent()
        prev_sibling = li.left_sibling()

        if not parent:
            logger.warning('Root of %s is an li.',
                           doc.policy.title_with_number)
            continue
        if parent.node_type == 'list':  # all is well
            continue

        if prev_sibling and prev_sibling.node_type == 'list':
            li.append_to(prev_sibling)
            return ensure_listitem_in_list(doc)
        # else: create new list to wrap this one
        logger.warning('Could not fix li in %s', doc.policy.title_with_number)

    return doc  # no changes needed


def ensure_section_has_heading(doc: DocCursor) -> DocCursor:
    """We expect all sections to have a heading. Fill the missing data with
    placeholder text."""
    # materialize so we don't need to worry about a modified iterator
    secs = list(doc.filter(lambda n: n.node_type == 'sec'))
    for sec in secs:
        children = list(sec.children())
        if not children or children[0].node_type != 'heading':
            sec.add_child('heading', insert_pos=0, text='--Missing Heading--',
                          policy_id=doc.policy_id)
    return doc


transforms = [
    ensure_listitem_in_list,
    ensure_section_has_heading,
]


def migrate_doc(doc: DocCursor) -> DocCursor:
    """Apply all transforms to a given document. Save it and return."""
    for transform in transforms:
        doc = transform(doc)
    doc.nested_set_renumber(bulk_create=False)
    for node in doc.walk():
        node.save()
    return doc


class Command(BaseCommand):
    help = ( # noqa (overriding a builtin)
        "Run through (idempotent) document migrations to mass-fixup docs.")

    def handle(self, *args, **kwargs):
        roots = DocNode.objects.filter(depth=0)
        with tqdm(total=roots.count()) as pbar:
            for root_docnode in roots:
                with transaction.atomic():
                    doc = DocCursor.load_from_model(root_docnode)
                    migrate_doc(doc)
                pbar.update(1)
