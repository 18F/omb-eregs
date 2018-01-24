from io import BytesIO
from pathlib import Path

import pytest
from django.core.management import call_command
from model_mommy import mommy

from document.models import DocNode
from document.parsers import AkomaNtosoParser
from document.renderers import AkomaNtosoRenderer
from document.serializers.doc_cursor import DocCursorSerializer
from document.tree import DocCursor
from reqs.models import Policy

MY_DIR = Path(__file__).parent.resolve()

EXAMPLE_DOCS_DIR = MY_DIR / '..' / '..' / 'example_docs'


def get_cursor_for_policy(policy: Policy) -> DocCursor:
    docnode = DocNode.objects.filter(policy=policy, depth=0).\
        prefetch_annotations().first()
    cursor = DocCursor.load_from_model(docnode, subtree=False)
    cursor.add_models(cursor.descendants().prefetch_annotations())
    return cursor


@pytest.mark.django_db
def test_akn_works():
    # Phase 1: Import the document from XML, serialize it, and
    # render it to AKN.
    policy = mommy.make(Policy, omb_policy_id='M-16-19')
    call_command('import_xml_doc', str(EXAMPLE_DOCS_DIR / 'm_16_19_1.xml'),
                 'M-16-19')
    cursor = get_cursor_for_policy(policy)

    original_data = DocCursorSerializer(cursor).data
    original_akn = AkomaNtosoRenderer().render(original_data)

    # Phase 2: Parse the AKN, deserialize it, and save it.
    parsed_akn_data = AkomaNtosoParser().parse(BytesIO(original_akn))
    serializer = DocCursorSerializer(cursor, data=parsed_akn_data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    # Phase 3: Re-serialize the document and render it to AKN.
    cursor = get_cursor_for_policy(policy)
    data = DocCursorSerializer(cursor).data
    akn = AkomaNtosoRenderer().render(data)

    # Now ensure the AKN from phase 1 matches the AKN from
    # phase 3.
    assert original_akn.decode('utf-8') == akn.decode('utf-8')
