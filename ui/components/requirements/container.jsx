import React from 'react';
import { resolve } from 'react-resolver';
import { Link, withRouter } from 'react-router';

import { theApi } from '../../globals';
import Pagers from '../pagers';
import FilterList from '../filter-list';
import Requirement from './requirement';

function Container({ keywords, pagedReqs, policies, router }) {
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
            />)
          }
        </ul>
        <Pagers location={router.location} count={pagedReqs.count} />
      </div>
    </div>
  );
}

Container.defaultProps = {
  keywords: [],
  pagedReqs: { results: [], count: 0 },
  policies: [],
  router: { location: {} },
};

Container.propTypes = {
  keywords: FilterList.propTypes.existingFilters,
  pagedReqs: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
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

const fetchRequirements = ({ location: { query } }) =>
  theApi().requirements.fetch(query);
const fetchKeywords = ({ location: { query: { keywords__id__in } } }) =>
  theApi().keywords.withIds(keywords__id__in);
const fetchPolicies = ({ location: { query: { policy_id__in } } }) =>
  theApi().policies.withIds(policy_id__in);

export default resolve({
  keywords: fetchKeywords,
  pagedReqs: fetchRequirements,
  policies: fetchPolicies,
})(withRouter(Container));
