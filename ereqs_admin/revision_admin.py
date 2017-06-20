import json

from django.contrib import messages
from django.core import serializers
from reversion.admin import VersionAdmin


CERTAIN_WARNING = """
    This version was created before the current fields were finalized. Please
    carefully review the data before reverting.
    """
HEDGED_WARNING = """
    This version may have been created before the current fields were
    finalized. Please carefully review the data before reverting.
    """


def schema_mismatch(version, example):
    """Does the serialized version contain the same fields as the example
    model instance?"""
    def fields(dictionary):
        return set(dictionary[0]['fields'])

    # Use the same machinery that reversions uses
    curr_fields = fields(serializers.serialize('python', [example]))
    version_fields = fields(json.loads(version.serialized_data))
    return curr_fields != version_fields


def alert_if_mismatch(request, version):
    """Users should be notified if the version they're reverting has a
    different schema than the current."""
    example = version._model.objects.first()
    if not example:
        messages.warning(request, HEDGED_WARNING)
    elif schema_mismatch(version, example):
        messages.warning(request, CERTAIN_WARNING)


class EReqsVersionAdmin(VersionAdmin):
    """Extends VersionAdmin by adding a warning to the admin screen when
    trying to revert a version with a schema mismatch."""
    # @override
    def _reversion_revisionform_view(
            self, request, version, template_name, extra_context=None):
        alert_if_mismatch(request, version)

        return super()._reversion_revisionform_view(
            request, version, template_name, extra_context)
