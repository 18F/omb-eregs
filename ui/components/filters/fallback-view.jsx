import React from 'react';

import { redirectWhiteList } from '../../redirects';

export default function FallbackView(props) {
  const { insertParam, lookup, pathname, query } = props;
  return (
    <form action={`/search-redirect/${lookup}/`} method="GET">
      <input type="hidden" name="insertParam" value={insertParam} />
      <input type="hidden" name="redirectPathname" value={pathname} />
      <div className="flex clearfix relative">
        <input
          aria-labelledby={props['aria-labelledby']}
          type="text"
          name="q"
          className="filter-lookup-field rounded-left p1 border col col-9"
        />
        { Object.keys(query).map(key =>
          <input key={key} type="hidden" name={`redirectQuery__${key}`} value={query[key]} />)}
        <button
          type="submit"
          className="add-filter-button homepage-filter-button border rounded-right p1 col col-3"
        >
          <img alt="Add" src="/static/img/add-icon.svg" />
        </button>
      </div>
    </form>
  );
}
FallbackView.propTypes = {
  'aria-labelledby': React.PropTypes.string.isRequired,
  insertParam: React.PropTypes.string,
  lookup: React.PropTypes.string.isRequired,
  pathname: React.PropTypes.oneOf(redirectWhiteList).isRequired,
  query: React.PropTypes.shape({}),
};
FallbackView.defaultProps = {
  insertParam: '',
  query: {},
};
