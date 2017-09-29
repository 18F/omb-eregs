import PropTypes from 'prop-types';
import React from 'react';

export default function SearchFilterView(
  { filterControls, pageContent, selectedFilters, tabs }) {
  return (
    <div className="clearfix">
      <div className="sidebar sm-col sm-col-12 md-col-2 lg-col-2 p2 no-print">
        <div className="filter-header">Search and filter</div>
        {filterControls}
      </div>
      <div className="main col col-10 pl4 border-left max-width-3">
        <div className="tab-container no-print">
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
  filterControls: PropTypes.arrayOf(PropTypes.node),
  pageContent: PropTypes.node,
  selectedFilters: PropTypes.node,
  tabs: PropTypes.arrayOf(PropTypes.node),
};
SearchFilterView.defaultProps = {
  filterControls: [],
  pageContent: null,
  selectedFilters: null,
  tabs: [],
};
