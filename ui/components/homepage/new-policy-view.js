import PropTypes from 'prop-types';
import React from 'react';
import { policyLinkTag } from '../requirements/policy-link';

export default function NewPolicyView({ policy }) {
  const policyLink = policyLinkTag(policy);
  return (
    <li className="inline-block col col-6 pr2 mb2">
      { policyLink }
      <div className="h5">
        { policy.issuing_body }, { policy.issuance_pretty }
      </div>
    </li>
  );
}
NewPolicyView.propTypes = {
  policy: PropTypes.shape({
    id: PropTypes.number,
    issuance_pretty: PropTypes.string,
    issuing_body: PropTypes.string,
    title_with_number: PropTypes.string,
  }).isRequired,
};
