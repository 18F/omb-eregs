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
  heading: React.PropTypes.string.isRequired,
  headingLabel: React.PropTypes.string.isRequired,
  selector: React.PropTypes.node.isRequired,
};
