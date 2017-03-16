/**
 * A container for filters, which can be removed with a click. Currently
 * closely tied to Keywords, but can be generalized in the future
 **/
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router';

import { apiUrl } from '../globals';

function Filter({ keywordIds, keyword, query }) {
  const remainingKws = keywordIds.filter(v => v !== keyword.id.toString());
  const queryWithoutKw = Object.assign({}, query, {
    keywords__id__in: remainingKws.join(','),
  });
  const destination = { pathname: '/requirements/', query: queryWithoutKw };

  return (
    <li>
      {keyword.name}
      &nbsp;
      <Link to={destination}>x</Link>
    </li>
  );
}
Filter.defaultProps = {
  keywordIds: [],
  keyword: {},
  query: {},
};
Filter.propTypes = {
  keywordIds: React.PropTypes.arrayOf(React.PropTypes.string),
  keyword: React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  }),
  query: React.PropTypes.shape({}),
};

export default function FilterList({ query, keywords }) {
  const keywordIds = (query.keywords__id__in || '').split(',');
  const removeQuery = Object.assign({}, query);
  delete removeQuery.page;

  return (
    <div className="col col-2">
      <ol className="req-filter-ui">
        { keywords.map(keyword =>
          <Filter
            key={keyword.id} keywordIds={keywordIds} keyword={keyword}
            query={removeQuery}
          />)}
      </ol>
    </div>
  );
}
FilterList.defaultProps = {
  query: {},
  keywords: [],
};
FilterList.propTypes = {
  query: React.PropTypes.shape({
    keywords__id__in: React.PropTypes.string,
  }),
  keywords: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  })),
};

export function fetchData({ location: { query } }) {
  if (query.keywords__id__in) {
    const fetch = axios.get(`${apiUrl()}keywords/`, { params: { id__in: query.keywords__id__in } });
    return fetch.then(({ data: { results } }) => results);
  }
  return Promise.resolve([]);
}
