from unittest import mock

import pytest

from ombpdf import annotators


def test_get_annotator_works_for_all_annotators():
    for name in annotators.ANNOTATORS:
        assert callable(annotators.get(name))


def test_value_error_raised_on_invalid_annotator():
    with pytest.raises(ValueError, match='Invalid annotator: blah'):
        annotators.get('blah')


def test_annotator_tracker_works():
    fake_doc = mock.Mock()
    at = annotators.AnnotatorTracker(fake_doc)

    with mock.patch.object(annotators, 'get') as get:
        fake_annotator = mock.Mock()
        get.return_value = fake_annotator

        # Ensure that requiring the annotator once runs it.
        at.require('footnotes')
        get.assert_called_once_with('footnotes')
        fake_annotator.assert_called_once_with(fake_doc)

        # Ensure that requiring the annotator again doesn't actually run it.
        at.require('footnotes')
        assert get.call_count == 1
        assert fake_annotator.call_count == 1
