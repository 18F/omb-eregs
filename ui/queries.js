import moment from 'moment';

import api from './api';

const NUM_POLICIES = 4;
// See https://momentjs.com/docs/#/displaying/ for options
const DATE_FORMAT = 'MMMM D, YYYY';


export function formatIssuance(policy) {
  return Object.assign({}, policy, {
    issuance_pretty: moment(policy.issuance).format(DATE_FORMAT),
  });
}

export const homepageData = {
  recentPolicies: () =>
    api.policies.fetchResults({ ordering: '-issuance' })
      .then(results => results.slice(0, NUM_POLICIES).map(formatIssuance)),
};
