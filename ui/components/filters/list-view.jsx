import React from 'react';

export default function FilterListView({ heading, autocompleter }) {
  return (
    <div className="req-filter-ui my2">
      <div className="filter-section-header bold">{heading}</div>
      {autocompleter}
    </div>
  );
}
FilterListView.propTypes = {
  heading: React.PropTypes.string,
  autocompleter: React.PropTypes.node,
};
FilterListView.defaultProps = {
  heading: '',
  autocompleter: null,
};

