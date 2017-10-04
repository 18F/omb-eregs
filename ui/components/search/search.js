import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';

export class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = { term: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  actionPath() {
    const path = this.props.router.pathname;
    return path.includes('policies') || path.includes('requirements') ? path : '/requirements/';
  }

  hiddenFields() {
    const modifiedQuery = this.query();
    return Object.keys(modifiedQuery).map(k => (
      <input type="hidden" key={k} name={k} value={modifiedQuery[k]} />
    ));
  }

  query() {
    const query = Object.assign({}, this.props.router.query);
    delete query.page;
    delete query[this.inputName()];

    return query;
  }

  inputName() {
    const path = this.props.router.pathname;
    return path.includes('policies') ? 'requirements__req_text__search' : 'req_text__search';
  }

  handleChange(e) {
    const { value } = e.target;
    this.setState({ term: value });
  }

  searchButton() {
    let button;
    if (this.props.buttonStyle == 'large') {
      button = (<button type="submit" className="filter-form-submit h4 py1 px3 rounded">Search</button>);
    } else {
      button = (<button type="submit" className="search-submit p1 gray-border">
        <img alt="Submit search" src="/static/img/search-icon.svg" />
      </button>);
    }
    return button;
  }

  handleSubmit(e) {
    e.preventDefault();
    const { router } = this.props;
    const { term } = this.state;
    const pathname = this.actionPath();
    const query = Object.assign({}, this.query(), { [this.inputName()]: term });
    router.push({ pathname, query });
  }

  render() {
    return (
      <div className="search-form pr2 no-print">
        <form
          method="GET"
          action={this.actionPath()}
          className="mb0 flex items-center"
          onSubmit={this.handleSubmit}
        >
          <input
            aria-label="Search term"
            name={this.inputName()}
            type="text"
            placeholder="Search"
            className="search-input p1 gray-border"
            onChange={this.handleChange}
            value={this.state.term}
          />
          {this.hiddenFields()}
          {this.searchButton()}
        </form>
      </div>
    );
  }
}
Search.propTypes = {
  buttonStyle: PropTypes.string,
  router: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};

Search.defaultProps = {
  buttonStyle: 'small'
};

export default withRouter(Search);
