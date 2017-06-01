import React from 'react';
import { Link } from 'react-router';

export default function NewPolicyView({ policy }) {
  return (
    <li className="inline-block col col-6 pr2 mb2">
      <Link
        className="text-decoration-none"
        to={{ pathname: '/policies', query: { id__in: policy.id } }}
      >
        { policy.title_with_number }
      </Link>
      <div className="h5">
        { policy.issuing_body }, { policy.issuance_pretty }
      </div>
    </li>
  );
}
NewPolicyView.propTypes = {
  policy: React.PropTypes.shape({
    id: React.PropTypes.number,
    issuance_pretty: React.PropTypes.string,
    issuing_body: React.PropTypes.string,
    title_with_number: React.PropTypes.string,
  }).isRequired,
};
