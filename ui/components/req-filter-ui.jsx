import axios from 'axios';
import React from 'react';

import { apiUrl } from '../globals';

export default function ReqFilterUI({ keywords }) {
  return (
    <ol className="req-filter-ui">
      { keywords.map(keyword => <li key={keyword.id}>{keyword.name}</li>) }
    </ol>
  );
}
ReqFilterUI.defaultProps = {
  keywords: [],
};
ReqFilterUI.propTypes = {
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
