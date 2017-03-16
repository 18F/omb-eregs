import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

import { apiUrl } from '../globals';
import Pagers from './pagers';
import FilterList, { fetchData as fetchKeywords } from './filter-list';

function Requirement({ requirement }) {
  return <li className="gray-border rounded border p2 my2 clearfix">
    <span className="inline-block col col-1">
      {requirement.req_id}
    </span>
    <span className="inline-block col col-11">
      {requirement.req_text}
    </span>
  </li>;
}

function Requirements({ location: { query }, pagedReqs, keywords }) {
  return (
    <div>
      <FilterList keywords={keywords} query={query} />
      <div className="col col-10 px2 border-left">
        <h1>Requirements</h1>
        <ul className="list-reset">
          { pagedReqs.results.map(requirement =>
            <Requirement key={requirement.req_id} requirement={requirement} />) }
        </ul>
        <Pagers pathname="/requirements/" query={query} count={pagedReqs.count} />
      </div>
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
