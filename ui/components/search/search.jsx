import React from 'react';

export default class Search extends React.Component {
  hiddenFields() {
    const query = this.context.router.location.query;
    const modifiedQuery = Object.assign({}, query);
    delete modifiedQuery.page;
    delete modifiedQuery.req_text__search;
    return Object.keys(modifiedQuery).map(k =>
      <input type="hidden" key={k} name={k} value={modifiedQuery[k]} />);
  }

  inputName() {
    return this.context.router.location.pathname.includes('requirements') ? 'req_text__search' : 'requirements__req_text__search';
  }

  render() {
    return (
      <form method="GET" action={this.context.router.location.pathname}>
        <input name={this.inputName()} type="text" placeholder="Search..." />
        { this.hiddenFields() }
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

Search.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      query: React.PropTypes.shape({}),
      pathname: React.PropTypes.string,
    }),
  }),
};
