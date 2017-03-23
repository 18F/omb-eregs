import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';
import { Link, withRouter } from 'react-router';

import { apiUrl } from '../globals';
import Pagers from './pagers';
import FilterList, { fetchKeywords, fetchPolicies } from './filter-list';

function Requirement({ requirement }) {
  return (
    <li className="req border rounded p2 mb2 clearfix max-width-3">
      <div className="req-id col col-1 mb2">
        { requirement.req_id }
      </div>
      <div className="req-text col col-11 pl1">
        { requirement.req_text.split('\n').map(line => (
          <span className="req-text-line mb1">{ line }<br /></span>
          ))}
        <div className="clearfix mt3">
          <span className="applies-to mr2">
            Applies to: [not implemented]
          </span>
          <span className="sunset-date">
            Sunset date by { requirement.policy.sunset || 'none' }
          </span>
        </div>
      </div>
    </li>
  );
}

function Requirements({ keywords, pagedReqs, policies, router }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        <FilterList existingFilters={keywords} lookup="keywords" router={router} />
        <FilterList existingFilters={policies} lookup="policies" router={router} />
      </div>
      <div className="col col-10 pl4 border-left">
        <div>
          <span className="mr4">Organize by</span>
          <ul className="list-reset inline-block">
            <li className="inline-block mr4 bold">Requirement</li>
            <li className="inline-block mr4">
              <Link to="/#not-implemented">Policy</Link>
            </li>
          </ul>
        </div>
        <ul className="list-reset">
          { pagedReqs.results.map(requirement =>
            <Requirement
              key={requirement.req_id}
              requirement={requirement}
              sunset={requirement.policy.sunset}
            />)
          }
        </ul>
        <Pagers location={router.location} count={pagedReqs.count} />
      </div>
    </div>
  );
}

Requirements.defaultProps = {
  keywords: [],
  pagedReqs: { results: [], count: 0 },
  policies: [],
  router: { location: {} },
};

Requirements.propTypes = {
  keywords: FilterList.propTypes.existingFilters,
  pagedReqs: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      policy: React.PropTypes.shape({
        sunset: React.PropTypes.string,
      }),
      req_text: React.PropTypes.string,
      req_id: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
  policies: FilterList.propTypes.existingFilters,
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({}),
  }),
};

Requirement.defaultProps = {
  requirement: {},
};

Requirement.propTypes = {
  requirement: React.PropTypes.shape({
    sunset: React.PropTypes.string,
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string,
  }),
};

function fetchRequirements({ location: { query } }) {
  return axios.get(`${apiUrl()}requirements/`, { params: query }).then(
      ({ data }) => data);
}

export default resolve({
  keywords: fetchKeywords,
  pagedReqs: fetchRequirements,
  policies: fetchPolicies,
})(withRouter(Requirements));
