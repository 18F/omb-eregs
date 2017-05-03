import React from 'react';

export default function FilterListView({ heading, removeLinks, autocompleter }) {
  return (
    <div className="req-filter-ui my2">
      <div className="filter-section-header bold">{heading}</div>
      <ol className="list-reset">
        {removeLinks}
      </ol>
      {autocompleter}
    </div>
  );
}
FilterListView.propTypes = {
  heading: React.PropTypes.string,
  removeLinks: React.PropTypes.arrayOf(React.PropTypes.node),
  autocompleter: React.PropTypes.node,
};
FilterListView.defaultProps = {
  heading: '',
  removeLinks: [],
  autocompleter: null,
};

