import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';

import routes from '../../routes';

const defaultRoute = 'policies';
const inputNameMapping = {
  policies: 'requirements__req_text__search',
  requirements: 'req_text__search',
};


export class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = { term: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  currentRoute() {
    const route = routes.match(this.props.router.pathname).route;
    if (route) {
      return route.name;
    }
    return null;
  }

  actionPath() {
    const route = this.currentRoute();
    if (Object.keys(inputNameMapping).includes(route)) {
      return `/${route}`;
    }
    return `/${defaultRoute}`;
  }

  hiddenFields() {
    const modifiedQuery = this.query();
    return Object.keys(modifiedQuery).map(k => (
      <input type="hidden" key={k} name={k} value={modifiedQuery[k]} />
    ));
  }

  query() {
    const route = this.currentRoute();
    if (Object.keys(inputNameMapping).includes(route)) {
      const query = { ...this.props.router.query };
      delete query.page;
      delete query[this.inputName()];

      return query;
    }
    return {};
  }

  inputName() {
    const route = this.currentRoute();
    return inputNameMapping[route] || inputNameMapping[defaultRoute];
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
