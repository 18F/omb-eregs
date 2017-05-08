import React from 'react';
import { resolve } from 'react-resolver';

import PoliciesView from './policies-view';
import SearchFilterView from '../search-filter-view';
import TabView from '../tab-view';
import TopicFilterContainer from '../filters/topic-container';
import api from '../../api';

function requirementsTab(policyQuery) {
  // Transform filter keys into the format expected by requirements
  const reqQuery = {};
  Object.keys(policyQuery).forEach((key) => {
    if (key.startsWith('requirements__')) {
      reqQuery[key.slice('requirements__'.length)] = policyQuery[key];
    } else if (!['page', 'ordering', 'format'].includes(key)) {
      reqQuery[`policy__${key}`] = policyQuery[key];
    }
  });
  const link = { pathname: '/requirements', query: reqQuery };
  return React.createElement(
    TabView,
    { active: false, tabName: 'Requirements', key: 'Requirements', link });
}

export function PoliciesContainer({ location: { query }, pagedPolicies }) {
  const filterControls = [
    React.createElement(
      TopicFilterContainer,
      { query, paramName: 'requirements__topics__id__in', key: 'topic' }),
  ];
  const tabs = [
    requirementsTab(query),
    React.createElement(
      TabView, { active: true, tabName: 'Policies', key: 'Policies' }),
  ];
  const pageContent = React.createElement(
    PoliciesView,
    {
      policies: pagedPolicies.results,
      count: pagedPolicies.count,
      topicsIds: query.requirements__topics__id__in,
    },
  );
  const selectedFilters = [];
  return React.createElement(
    SearchFilterView, { filterControls, pageContent, selectedFilters, tabs });
}
PoliciesContainer.propTypes = {
  location: React.PropTypes.shape({ query: React.PropTypes.shape({}) }),
  pagedPolicies: React.PropTypes.shape({
    results: PoliciesView.propTypes.policies,
    count: PoliciesView.propTypes.count,
  }),
};
PoliciesContainer.defaultProps = {
  location: { query: {} },
  pagedPolicies: { results: [], count: 0 },
};

function fetchPolicies({ location: { query } }) {
  const params = Object.assign({ ordering: 'policy_number' }, query);
  return api.policies.fetch(params);
}

export default resolve({
  pagedPolicies: fetchPolicies,
})(PoliciesContainer);

