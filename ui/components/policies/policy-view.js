import PropTypes from 'prop-types';
import React from 'react';

import Policy from '../../util/policy';
import Link from '../link';

export default function PolicyView({ policy }) {
  const percentMatch = (100 * (policy.relevantReqs / policy.totalReqs)).toFixed();
  let policyTitle = policy.titleWithNumber;

  if (policy.hasPublishedDocument) {
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
            {percentMatch}% match
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
