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
      <form
        method="GET"
        action={this.actionPath()}
        onSubmit={this.handleSubmit}
      >
        <input
          aria-label="Search term"
          name={this.inputName()}
          type="text"
          placeholder={this.props.placeholder}
          className="search-input"
          onChange={this.handleChange}
          value={this.state.term}
        />
        {this.hiddenFields()}
        <button type="submit" className="search-submit">
          {this.props.buttonContent}
        </button>
      </form>
    );
  }
}
Search.propTypes = {
  buttonContent: PropTypes.node,
  placeholder: PropTypes.string,
  router: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};
Search.defaultProps = {
  buttonContent: null,
  placeholder: 'Search',
};

export default withRouter(Search);
