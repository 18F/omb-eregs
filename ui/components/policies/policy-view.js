import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../../routes';
import ExternalLink from '../external-link';

export default function Policy({ policy, topicsIds }) {
  const linkParams = {
    policy__id__in: policy.id,
    topics__id__in: topicsIds,
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
              <Link route="requirements" params={linkParams}>
                <a aria-label="Relevant requirements" className={countClass}>
                  {relevantReqCount}
                </a>
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
            <Link route="requirements" params={{ policy__id__in: policy.id }}>
              <a>View all requirements</a>
            </Link>
          </div>
        </div>
      </section>
    </li>
  );
}

Policy.propTypes = {
  policy: PropTypes.shape({
    id: PropTypes.number,
    title_with_number: PropTypes.string,
    relevant_reqs: PropTypes.number,
    total_reqs: PropTypes.number,
  }),
  topicsIds: PropTypes.string,
};

Policy.defaultProps = {
  policy: {},
  topicsIds: '',
};
