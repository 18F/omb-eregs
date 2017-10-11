import PropTypes from 'prop-types';
import React from 'react';

import Link from '../link';

export function policyLinkTag(policy) {
  return (
    <Link route="policies" params={{ id__in: policy.id }}>
      {policy.title_with_number}
    </Link>
  );
}

export default function PolicyLink({ policy }) {
  return (
    <div className="policy-title metadata">
      Policy title:{' '}
      { policyLinkTag(policy) }
    </div>
  );
}

PolicyLink.propTypes = {
  policy: PropTypes.shape({
    id: PropTypes.number,
    title_with_number: PropTypes.string,
  }).isRequired,
};
