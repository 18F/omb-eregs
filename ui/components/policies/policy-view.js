import PropTypes from 'prop-types';
import React from 'react';

import Policy from '../../util/policy';
import Link from '../link';

export default function PolicyView({ policy, topicsIds }) {
  const linkParams = {
    policy__id__in: policy.id,
    topics__id__in: topicsIds,
  };
  const relevantReqCount = policy.relevantReqs >= 100 ? '99+' : policy.relevantReqs;
  const countClass = relevantReqCount === '99+' ? 'ninety-nine-plus' : '';
  let policyTitle = policy.titleWithNumber;

  if (policy.hasDocument()) {
    policyTitle = (
      <Link {...policy.getDocumentLinkProps()}>
        {policyTitle}
      </Link>
    );
  }

  return (
    <li key={policy.id} className="my2">
      <section className="policy border rounded gray-border p2">
        <h2 className="mt0 mb3">{policyTitle}</h2>
        <div className="clearfix">
          <div className="requirements-links mb1 sm-col sm-col-12 md-col-8">
            <div className="circle-bg border gray-border center p1">
              <Link
                route="requirements"
                params={linkParams}
                aria-label="Relevant requirements"
                className={countClass}
              >
                {relevantReqCount}
              </Link>
            </div> of&nbsp;
            {policy.totalReqs} requirements
             match your search
          </div>
          <div className="sm-col sm-col-12 md-col-4 right-align">
            <Link href={policy.originalUrl}>
              View original&nbsp;<i className="fa fa-external-link" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </li>
  );
}

PolicyView.propTypes = {
  policy: PropTypes.instanceOf(Policy),
  topicsIds: PropTypes.string,
};

PolicyView.defaultProps = {
  policy: {},
  topicsIds: '',
};
