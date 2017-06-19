import React from 'react';
import {Collapse} from 'react-collapse';

export default class SearchFilterView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {isOpened: false};
    this.openFilters = this.openFilters.bind(this);
  }

  arrowClasses() {
    const defaultClass = "open-close-indicator";
    const openClass = defaultClass + " open";

    return (this.state.isOpened ? openClass : defaultClass);
  }

  openFilters() {
    this.setState(
      {isOpened: !this.state.isOpened}
    );
  }

  render() {
    return (
      <div className="clearfix">
        <a className="mobile-filters md-hide lg-hide" onClick={this.openFilters} role="link">
          Edit Filters
          <div className={this.arrowClasses()} />
        </a>
        <Collapse isOpened={this.state.isOpened} fixedHeight={180}>
          <div className="sidebar sm-col sm-col-12 md-col-2 lg-col-2 p2 no-print">
            Search and filter
            {this.props.filterControls}
            <div className="show-results" role="link" onClick={this.openFilters}>Show results</div>
          </div>
        </Collapse>
        <div className="main sm-col sm-col-12 md-col-10 lg-col-10 pl4 border-left max-width-3">
          <div className="tab-container no-print">
            <span className="mr4">View:</span>
            <ul className="organize-tabs list-reset inline-block">
              {this.props.tabs}
            </ul>
          </div>
          { this.props.selectedFilters }
          {/* page counts here */}
          { this.props.pageContent }
        </div>
      </div>
    );
  }
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
