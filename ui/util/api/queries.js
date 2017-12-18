import moment from 'moment';
import PropTypes from 'prop-types';
import validator from 'validator';

import endpoints from './endpoints';
import { apiNameField, search } from '../../lookup-search';
import { routes } from '../../routes';

const NUM_POLICIES = 4;
// See https://momentjs.com/docs/#/displaying/ for options
const DATE_FORMAT = 'MMMM D, YYYY';

export function formatIssuance(policy) {
  return {
    ...policy,
    issuance_pretty: moment(policy.issuance).format(DATE_FORMAT),
  };
}

export async function propagate404(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { statusCode: 404 };
    }
    throw err;
  }
}

export async function homepageData() {
  const results = await endpoints.policies.fetchResults({ ordering: '-issuance' });
  return { recentPolicies: results.slice(0, NUM_POLICIES) };
}

export function policiesData({ query }) {
  return propagate404(async () => {
    const [
      existingAgencies,
      existingPolicies,
      existingTopics,
      pagedPolicies,
    ] = await Promise.all([
      endpoints.topics.withIds(query.requirements__all_agencies__id__in),
      endpoints.policies.withIds(query.id__in),
      endpoints.topics.withIds(query.requirements__topics__id__in),
      endpoints.policies.fetch(Object.assign({ ordering: 'policy_number' }, query)),
    ]);
    return {
      existingAgencies,
      existingPolicies,
      existingTopics,
      pagedPolicies,
    };
  });
}

export function requirementsData({ query }) {
  return propagate404(async () => {
    const [
      existingAgencies,
      existingPolicies,
      existingTopics,
      pagedReqs,
    ] = await Promise.all([
      endpoints.topics.withIds(query.all_agencies__id_in),
      endpoints.policies.withIds(query.policy__id__in),
      endpoints.topics.withIds(query.topics__id__in),
      endpoints.requirements.fetch(query),
    ]);
    return {
      existingAgencies,
      existingPolicies,
      existingTopics,
      pagedReqs,
    };
  });
}

/*
 * We expect a query like
 *  /some/path/?q=term&insertParam=lookup_id__in&page=1
 *    &redirectRoute=/prev/path&redirectQuery__lookup_id__in=1,2,3
 *    &redirectQuery__someOtherParameter=value
 * Return a clean version of that data; if we can't validate, raise an
 * exception.
 */
const redirectQueryPrefix = 'redirectQuery__';
const validRoutes = routes.map(r => r.name).filter(n => n);

function userError(message) {
  const err = new Error(message);
  err.msg = message; // Error's aren't serialized
  err.statusCode = 400;
  return err;
}

export function cleanSearchParams(query) {
  const clean = {
    q: (query.q || '').toString(),
    insertParam: (query.insertParam || '').toString(),
    lookup: (query.lookup || '').toString(),
    redirect: {
      route: (query.redirectRoute || '').toString(),
      query: {},
    },
    page: (query.page || '1').toString(),
  };
  Object.keys(query).forEach((key) => {
    if (key.startsWith(redirectQueryPrefix)) {
      clean.redirect.query[key.substring(redirectQueryPrefix.length)] = query[key];
    }
  });

  if (validator.isEmpty(clean.insertParam)) {
    throw userError('Needs an "insertParam" parameter');
  } else if (!validator.isIn(clean.redirect.route, validRoutes)) {
    throw userError('Invalid "redirectRoute" parameter');
  } else if (!validator.isIn(clean.lookup, Object.keys(apiNameField))) {
    throw userError('Invalid "lookup" parameter');
  }

  return clean;
}
export const cleanSearchParamTypes = PropTypes.shape({
  q: PropTypes.string.isRequired,
  insertParam: PropTypes.string.isRequired,
  lookup: PropTypes.oneOf(Object.keys(apiNameField)).isRequired,
  redirect: PropTypes.shape({
    route: PropTypes.string.isRequired,
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
});

export async function searchRedirectData({ query }) {
  const userParams = cleanSearchParams(query);
  const pagedEntries = await search(userParams.lookup, userParams.q, userParams.page);
  return { pagedEntries, userParams };
}

/*
 * Mix in the idToInsert into the original request parameters.
 */
export function redirectQuery(query, insertParam, idToInsert) {
  const result = Object.assign({}, query);
  const ids = (result[insertParam] || '').split(',').filter(i => i.length > 0);
  delete result.page;

  if (!ids.includes(idToInsert)) {
    ids.push(idToInsert);
  }
  result[insertParam] = ids.join(',');

  return result;
}

export async function documentData({ query }) {
  const docNode = await endpoints.document.fetchOne(query.policyId);
  return { docNode };
}
