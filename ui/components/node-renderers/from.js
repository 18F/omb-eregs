import PropTypes from 'prop-types';
import React from 'react';

import DocumentNode from '../../util/document-node';
import LabeledText from '../labeled-text';

export default function From({ docNode }) {
  return (
    <LabeledText id="from" label={docNode.marker}>
      { docNode.text }
    </LabeledText>
  );
}
From.propTypes = {
  docNode: PropTypes.instanceOf(DocumentNode).isRequired,
};
