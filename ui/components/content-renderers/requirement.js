import PropTypes from 'prop-types';
import React from 'react';

import renderContents from '../../util/render-contents';

export default function Requirement({ content }) {
  return (
    <span className="requirement-content">
      <i className="fa fa-star" aria-hidden="true" />&nbsp;{ renderContents(content.inlines) }
    </span>
  );
}
Requirement.propTypes = {
  content: PropTypes.shape({
    inlines: PropTypes.arrayOf(PropTypes.shape({})), // recursive
  }).isRequired,
};
