import React from 'react';

export default function SearchFilterView(
  { filterControls, pageContent, selectedFilters, tabs }) {
  return (
    <div className="clearfix">
      <div className="sidebar col col-2 p2">
        Search and filter
        {filterControls}
      </div>
      <div className="main col col-10 pl4 border-left max-width-3">
        <div className="tab-container">
          <span className="mr4">View:</span>
          <ul className="organize-tabs list-reset inline-block">
            {tabs}
          </ul>
        </div>
        { selectedFilters }
        {/* page counts here */}
        { pageContent }
      </div>
    </div>
  );
}

SearchFilterView.propTypes = {
  filterControls: React.PropTypes.arrayOf(React.PropTypes.node),
  pageContent: React.PropTypes.node,
  selectedFilters: React.PropTypes.node,
  tabs: React.PropTypes.arrayOf(React.PropTypes.node),
};
SearchFilterView.defaultProps = {
  filterControls: [],
  pageContent: null,
  selectedFilters: null,
  tabs: [],
};
