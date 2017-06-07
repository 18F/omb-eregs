import moment from 'moment';
import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../../api';
import NewPolicyView from './view';

const NUM_POLICIES = 4;
// See https://momentjs.com/docs/#/displaying/ for options
const DATE_FORMAT = 'MMMM D, YYYY';

export function NewPoliciesContainer({ recentPolicies }) {
  const lis = recentPolicies.map(policy =>
    React.createElement(NewPolicyView, { policy, key: policy.id }));
  return React.createElement('ol', { className: 'list-reset clearfix' }, ...lis);
}
NewPoliciesContainer.propTypes = {
  recentPolicies: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
  })).isRequired,
};

export function formatIssuance(policy) {
  return Object.assign({}, policy, {
    issuance_pretty: moment(policy.issuance).format(DATE_FORMAT),
  });
}

export function fetchRecentPolicies() {
  return api.policies.fetchResults({ ordering: '-issuance' })
    .then(results => results.slice(0, NUM_POLICIES).map(formatIssuance));
}

export default resolve({
  recentPolicies: fetchRecentPolicies,
})(NewPoliciesContainer);
