import React from 'react';
import { Link } from 'react-router';

export default function Policy({ policy, topicsIds }) {
  const allReqs = {
    pathname: '/requirements',
    query: { policy_id: policy.id },
  };
  const relevantReqs = {
    pathname: '/requirements',
    query: {
      policy_id: policy.id,
      topics__id__in: topicsIds,
    },
  };
  return (
    <li key={policy.id} className="py1">
      <section className="border rounded gray-border p2">
        <h2 className="mt0 mb3">{policy.title}</h2>
        <div className="clearfix">
          <span className="requirements-links col col-6">
            <span className="circle-bg border gray-border p1">
              <Link to={relevantReqs}>
                {policy.relevant_reqs}
              </Link>
            </span> of <Link to={allReqs}>
              {policy.total_reqs} requirements
            </Link> match your search
          </span>
          <span className="download-policy-link icon-links col col-3">Download policy PDF</span>
          <span className="view-requirements-link icon-links col col-3">
            <Link to={allReqs}>View all requirements</Link>
          </span>
        </div>
      </section>
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
  topicsIds: React.PropTypes.string,
};

Policy.defaultProps = {
  policy: {},
  topicsIds: '',
};
