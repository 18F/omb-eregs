from io import BytesIO
from pathlib import Path

import pytest
from django.core.management import call_command
from model_mommy import mommy
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer

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


@pytest.mark.parametrize("parser_class,renderer_class", [
    (AkomaNtosoParser, AkomaNtosoRenderer),
    pytest.param(JSONParser, JSONRenderer, marks=pytest.mark.skip(
        reason=("Intermittent failure; see "
                "https://github.com/18F/omb-eregs/issues/974")
    )),
])
@pytest.mark.django_db
def test_end_to_end(parser_class, renderer_class):
    # Phase 1: Import the document from XML, serialize it, and
    # render it.
    policy = mommy.make(Policy, omb_policy_id='M-16-19')
    call_command('import_xml_doc', str(EXAMPLE_DOCS_DIR / 'm_16_19_1.xml'),
                 'M-16-19')
    cursor = get_cursor_for_policy(policy)

    original_data = DocCursorSerializer(cursor).data
    original_rendered = renderer_class().render(original_data)

    # Phase 2: Parse the rendering, deserialize it, and save it.
    parsed_data = parser_class().parse(BytesIO(original_rendered))
    serializer = DocCursorSerializer(cursor, data=parsed_data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    # Phase 3: Re-serialize the document and render it.
    cursor = get_cursor_for_policy(policy)
    data = DocCursorSerializer(cursor).data
    rendered = renderer_class().render(data)

    # Now ensure the rendering from phase 1 matches the one from
    # phase 3.
    assert original_rendered.decode('utf-8') == rendered.decode('utf-8')
