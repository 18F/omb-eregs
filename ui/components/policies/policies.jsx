import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../api';
import Pagers from '../pagers';

function Policies({ policiesResponse }) {
  const policies = policiesResponse.results;
  return (
    <div>
      <ul className="list-reset">
        { policies.map(policy =>
          <li key={policy.id}>
            <h3>{policy.title}</h3>
            {policy.relevant_reqs} of {policy.total_reqs} match your search
            <span className="download-policy-link">Download policy PDF</span>
            <span className="view-requirements-link">View all requirements</span>
          </li>
        )}
      </ul>
      <Pagers count={policies.count} />
    </div>
  );
}
Policies.defaultProps = {
  policies: { results: [], count: 0 },
};

Policies.propTypes = {
  policies: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      req_text: React.PropTypes.string,
      req_id: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
};

const fetchPolicies = ({ location: { query } }) => {
  const params = Object.assign({}, query, { ordering: 'policy__policy_number' });
  return api.policies.fetch(params);
};

export default resolve(
  'policies', fetchPolicies,
)(Policies);
