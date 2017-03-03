import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';

import { apiUrl } from '../globals';
import Pagers from './pagers';

function Keyword({ keyword }) {
  return (
    <li>
      <Link to={{ pathname: '/requirements/', query: { keywords__name__in: keyword } }} >{ keyword }</Link>
    </li>
  );
}

function Keywords({ location: { query }, data }) {
  return (
    <div>
      <h1>Keywords</h1>
      <ul>
        { data.results.map(keyword => <Keyword key={keyword.name} keyword={keyword.name} />) }
      </ul>
      <Pagers pathname="/keywords/" query={query} count={data.count} />
    </div>
  );
}

Keywords.defaultProps = {
  data: { results: [], count: 0 },
  location: { query: {} },
};

Keywords.propTypes = {
  data: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({}),
  }),
};

Keyword.defaultProps = {
  keyword: null,
};

Keyword.propTypes = {
  keyword: React.PropTypes.string,
};

export default resolve(
  'data',
  ({ location: { query } }) =>
    axios.get(`${apiUrl()}keywords/`, { params: query }).then(({ data }) => data),
)(Keywords);
