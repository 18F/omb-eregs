import PropTypes from 'prop-types';
import React from 'react';
import LabeledText from '../labeled-text';

export default function From({ docNode }) {
  return (
    <LabeledText id="from" label={docNode.marker}>
      { docNode.text }
    </LabeledText>
  );
}
From.propTypes = {
  docNode: PropTypes.shape({
    marker: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};
