import PropTypes from 'prop-types';
import React from 'react';

import Policy from '../../util/policy';
import Link from '../link';

export default function NewPolicyView({ policy }) {
  return (
    <li className="inline-block col col-6 pr2 mb2">
      <Link route="policies" params={{ id__in: policy.id }}>
        { policy.titleWithNumber }
      </Link>
      <div className="h5">
        { policy.issuancePretty() }
      </div>
    </li>
  );
}
NewPolicyView.propTypes = {
  policy: PropTypes.instanceOf(Policy).isRequired,
};
