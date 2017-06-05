import React from 'react';
import querystring from 'querystring';

import { redirectQuery } from '../lookup-search';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = { searchTerm: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ searchTerm: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { location } = this.props.router;
    const query = redirectQuery(location.query, 'req_text__search', this.state.searchTerm);
    const paramStr = querystring.stringify(query);
    this.props.router.push(`/requirements/?${paramStr}`);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          value={this.state.searchTerm}
          onChange={this.handleChange}
          type="text"
          placeholder="Search..."
        />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

Search.propTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape,
    push: React.PropTypes.func,
  }).isRequired,
};

