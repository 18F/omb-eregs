import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

import { apiUrl } from '../globals';
import Pagers from './pagers';
import FilterList, { fetchData as fetchKeywords } from './filter-list';

function Requirement({ requirement }) {
  return <li className="req">{requirement.req_id}: {requirement.req_text}</li>;
}

function Requirements({ location: { query }, pagedReqs, keywords }) {
  return (
    <div>
      <h1>Requirements</h1>
      <FilterList keywords={keywords} query={query} />
      <ul className="req-list">
        { pagedReqs.results.map(requirement =>
          <Requirement key={requirement.req_id} requirement={requirement} />) }
      </ul>
      <Pagers pathname="/requirements/" query={query} count={pagedReqs.count} />
    </div>
  );
}

Requirements.defaultProps = {
  pagedReqs: { results: [], count: 0 },
  keywords: FilterList.defaultProps.keywords,
  location: { query: {} },
};

Requirements.propTypes = {
  pagedReqs: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      req_text: React.PropTypes.string,
      req_id: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
  keywords: FilterList.propTypes.keywords,
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

function fetchRequirements({ location: { query } }) {
  return axios.get(`${apiUrl()}requirements/`, { params: query }).then(
      ({ data }) => data);
}

export default resolve({
  pagedReqs: fetchRequirements,
  keywords: fetchKeywords,
})(Requirements);
