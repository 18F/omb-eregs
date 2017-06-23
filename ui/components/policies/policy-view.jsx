import React from 'react';
import { Link } from 'react-router';

import ExternalLink from '../external-link';

export default function Policy({ policy, topicsIds }) {
  const allReqs = {
    pathname: '/requirements',
    query: { policy__id__in: policy.id },
  };
  const relevantReqs = {
    pathname: '/requirements',
    query: {
      policy__id__in: policy.id,
      topics__id__in: topicsIds,
    },
  };
  const relevantReqCount = policy.relevant_reqs >= 100 ? '99+' : policy.relevant_reqs;
  const countClass = relevantReqCount === '99+' ? 'ninety-nine-plus' : '';
  return (
    <li key={policy.id} className="my2">
      <section className="policy border rounded gray-border p2">
        <h2 className="mt0 mb3">{policy.title_with_number}</h2>
        <div className="clearfix">
          <div className="requirements-links mb1 sm-col sm-col-12 md-col-6">
            <div className="circle-bg border gray-border center p1">
              <Link aria-label="Relevant requirements" to={relevantReqs} className={countClass}>
                {relevantReqCount}
              </Link>
            </div> of&nbsp;
            {policy.total_reqs} requirements
             match your search
          </div>
          <div className="external-link icon-links sm-col sm-col-12 md-col-3">
            <ExternalLink href={policy.original_url}>
              View original
            </ExternalLink>
          </div>
          <div className="view-requirements-link icon-links sm-col sm-col-12 md-col-3">
            <Link to={allReqs}>View all requirements</Link>
          </div>
        </div>
      </section>
    </li>
  );
}

Policy.propTypes = {
  policy: React.PropTypes.shape({
    id: React.PropTypes.number,
    title_with_number: React.PropTypes.string,
    relevant_reqs: React.PropTypes.number,
    total_reqs: React.PropTypes.number,
  }),
  topicsIds: React.PropTypes.string,
};

Policy.defaultProps = {
  policy: {},
  topicsIds: '',
};
