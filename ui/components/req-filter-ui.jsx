import axios from 'axios';
import React from 'react';
import { Link } from 'react-router';

import { apiUrl } from '../globals';

function FilterItem({ keywordIds, keyword, query }) {
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
FilterItem.defaultProps = {
  keywordIds: [],
  keyword: {},
  query: {},
};
FilterItem.propTypes = {
  keywordIds: React.PropTypes.arrayOf(React.PropTypes.string),
  keyword: React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  }),
  query: React.PropTypes.shape({}),
};

export default function ReqFilterUI({ query, keywords }) {
  const keywordIds = (query.keywords__id__in || '').split(',');
  const removeQuery = Object.assign({}, query);
  delete removeQuery.page;

  return (
    <ol className="req-filter-ui">
      { keywords.map(keyword =>
        <FilterItem
          key={keyword.id} keywordIds={keywordIds} keyword={keyword}
          query={removeQuery}
        />)}
    </ol>
  );
}
ReqFilterUI.defaultProps = {
  query: {},
  keywords: [],
};
ReqFilterUI.propTypes = {
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
