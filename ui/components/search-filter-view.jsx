import React from 'react';

export default function SearchFilterView({ filters, tabs, pageContent }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        Search and filter
        {filters}
      </div>
      <div className="col col-10 pl4 border-left max-width-3">
        <div>
          <span className="mr4">View:</span>
          <ul className="organize-tabs list-reset inline-block">
            {tabs}
          </ul>
        </div>
        {/* selected filter display here */}
        {/* page counts here */}
        { pageContent }
      </div>
    </div>
  );
}

SearchFilterView.propTypes = {
  filters: React.PropTypes.arrayOf(React.PropTypes.node),
  tabs: React.PropTypes.arrayOf(React.PropTypes.node),
  pageContent: React.PropTypes.node,
};
SearchFilterView.defaultProps = {
  filters: [],
  tabs: [],
  pageContent: null,
};
