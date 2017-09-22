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

export const policiesData = {
  existingAgencies: ({ location: { query } }) =>
    api.topics.withIds(query.requirements__all_agencies__id__in),
  existingPolicies: ({ location: { query } }) =>
    api.policies.withIds(query.id__in),
  existingTopics: ({ location: { query } }) =>
    api.topics.withIds(query.requirements__topics__id__in),
  pagedPolicies: ({ location: { query } }) =>
    api.policies.fetch(Object.assign({ ordering: 'policy_number' }, query)),
};

export const requirementsData = {
  existingAgencies: ({ location: { query } }) =>
    api.topics.withIds(query.all_agencies__id__in),
  existingPolicies: ({ location: { query } }) =>
    api.policies.withIds(query.policy__id__in),
  existingTopics: ({ location: { query } }) =>
    api.topics.withIds(query.topics__id__in),
  pagedReqs: ({ location: { query } }) => api.requirements.fetch(query),
};
