import React from 'react';
import { Link } from 'react-router';

export default function Policy({ policy, query }) {
  const allReqs = {
    pathname: '/requirements',
    query: { policy_id: policy.id },
  };
  const relevantReqs = {
    pathname: '/requirements',
    query: {
      policy_id: policy.id,
      topics__id__in: query.requirements__topics__id__in,
    },
  };
  return (
    <li key={policy.id}>
      <h3>{policy.title}</h3>
      <Link to={relevantReqs}>
        {policy.relevant_reqs}
      </Link>
       of
      <Link to={allReqs}>
        {policy.total_reqs}
      </Link>
       match your search
      <span className="download-policy-link">Download policy PDF</span>
      <span className="view-requirements-link">
        <Link to={allReqs}>View all requirements</Link>
      </span>
    </li>
  );
}

Policy.propTypes = {
  policy: React.PropTypes.shape({
    id: React.PropTypes.number,
    title: React.PropTypes.string,
    relevant_reqs: React.PropTypes.number,
    total_reqs: React.PropTypes.number,
  }),
  query: React.PropTypes.shape({}),
};

Policy.defaultProps = {
  policy: [],
  query: {},
};
