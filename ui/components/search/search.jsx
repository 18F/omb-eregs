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
    return this.context.router.location.pathname.includes('policies') ? 'requirements__req_text__search' : 'req_text__search';
  }

  actionPath() {
    const path = this.context.router.location.pathname;
    return (path.includes('policies') || path.includes('requirements')) ? path : 'requirements/';
  }

  render() {
    return (
      <div className="search-form pr2">
        <form method="GET" action={this.actionPath()} className="mb0 flex items-center">
          <input name={this.inputName()} type="text" placeholder="Search" className="search-input p1 gray-border" />
          { this.hiddenFields() }
          <input type="image" src="/static/img/search-icon.svg" value="Submit" className="search-submit p1 gray-border" />
        </form>
      </div>
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
