import React from 'react';

import { redirectWhiteList } from '../../redirects';

export default function FallbackView({ insertParam, lookup, pathname, query }) {
  return (
    <form action={`/search-redirect/${lookup}/`} method="GET">
      <input type="hidden" name="insertParam" value={insertParam} />
      <input type="hidden" name="redirectPathname" value={pathname} />
      <div className="flex clearfix relative">
        <input
          type="text"
          name="q"
          className="filter-lookup-field rounded-left p1 border col col-9"
        />
        { Object.keys(query).map(key =>
          <input key={key} type="hidden" name={`redirectQuery__${key}`} value={query[key]} />)}
        <input
          type="submit"
          value="Add"
          className="add-filter-button border rounded-right p1 col col-3"
        />
      </div>
    </form>
  );
}
FallbackView.propTypes = {
  insertParam: React.PropTypes.string,
  lookup: React.PropTypes.string.isRequired,
  pathname: React.PropTypes.oneOf(redirectWhiteList).isRequired,
  query: React.PropTypes.shape({}),
};
FallbackView.defaultProps = {
  insertParam: '',
  query: {},
};
