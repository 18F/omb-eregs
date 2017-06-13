import React from 'react';

export default function FilterListView({ heading, selector }) {
  return (
    <div className="filter-ui my2">
      <div className="filter-section-header bold">{heading}</div>
      {selector}
    </div>
  );
}
FilterListView.propTypes = {
  heading: React.PropTypes.string,
  selector: React.PropTypes.node,
};
FilterListView.defaultProps = {
  heading: '',
  selector: null,
};

