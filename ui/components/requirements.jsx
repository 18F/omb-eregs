import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

import { apiUrl } from '../globals';
import Pagers from './pagers';

function Requirement({ requirement }) {
  return <li className="req">{requirement.req_id}: {requirement.req_text}</li>;
}

function Requirements({ location: { query }, data }) {
  return (
    <div>
      <h1>Requirements</h1>
      <h2>{query.keywords__name__in}</h2>
      <ul>
        { data.results.map(requirement =>
          <Requirement key={requirement.req_id} requirement={requirement} />) }
      </ul>
      <Pagers pathname="/requirements/" query={query} count={data.count} />
    </div>
  );
}

Requirements.defaultProps = {
  data: { results: [], count: 0 },
  location: { query: {} },
};

Requirements.propTypes = {
  data: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      req_text: React.PropTypes.string,
      req_id: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({
      keywords__name__in: React.PropTypes.string,
    }),
  }),
};

Requirement.defaultProps = {
  requirement: {},
};

Requirement.propTypes = {
  requirement: React.PropTypes.shape({
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string,
  }),
};

export default resolve(
  'data',
  ({ location: { query } }) =>
    axios.get(`${apiUrl()}requirements/`, { params: query }).then(({ data }) => data),
)(Requirements);
