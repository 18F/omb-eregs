import PropTypes from 'prop-types';
import React from 'react';

import renderContents from '../../util/render-contents';

export default function Cite({ content }) {
  return (
    <cite>{ renderContents(content.inlines) }</cite>
  );
}
Cite.propTypes = {
  content: PropTypes.shape({
    inlines: PropTypes.arrayOf(PropTypes.shape({})), // recursive
  }).isRequired,
};

