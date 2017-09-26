import PropTypes from 'prop-types';
import React from 'react';
import { Link } from '../../routes';

export default function NewPolicyView({ policy }) {
  return (
    <li className="inline-block col col-6 pr2 mb2">
      <Link route="policies" params={{ id__in: policy.id }}>
        <a>{ policy.title_with_number }</a>
      </Link>
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
