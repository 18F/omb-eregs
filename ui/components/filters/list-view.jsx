import PropTypes from 'prop-types';
import React from 'react';

export default function FilterListView({ heading, headingLabel, selector }) {
  return (
    <div className="filter-ui my2">
      <div className="filter-section-header bold" id={headingLabel}>{heading}</div>
      {selector}
    </div>
  );
}
FilterListView.propTypes = {
  heading: PropTypes.string.isRequired,
  headingLabel: PropTypes.string.isRequired,
  selector: PropTypes.node.isRequired,
};
