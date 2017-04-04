import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';

import api from '../api';
import Pagers from './pagers';

function Keyword({ keyword }) {
  return (
    <li>
      <Link to={{ pathname: '/requirements/', query: { keywords__id__in: keyword.id } }} >{ keyword.name }</Link>
    </li>
  );
}

Keyword.defaultProps = {
  keyword: {},
};
Keyword.propTypes = {
  keyword: React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  }),
};


function Keywords({ location, data }) {
  return (
    <div>
      <h1>Keywords</h1>
      <ul>
        { data.results.map(keyword => <Keyword key={keyword.id} keyword={keyword} />) }
      </ul>
      <Pagers location={location} count={data.count} />
    </div>
  );
}

Keywords.defaultProps = {
  data: { results: [], count: 0 },
  location: {},
};

Keywords.propTypes = {
  data: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(Keyword.propTypes.keyword),
    count: React.PropTypes.number,
  }),
  location: React.PropTypes.shape({}),
};

const fetchKeywords = ({ location: { query } }) =>
  api.keywords.fetch(query);

export default resolve(
  'data', fetchKeywords,
)(Keywords);
