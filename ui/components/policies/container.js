import React from 'react';
import { resolve } from 'react-resolver';

import PoliciesView from './policies-view';
import SearchFilterView from '../search-filter-view';
import TabView from '../tab-view';
import TopicFilterContainer from '../filters/topic-container';
import api from '../../api';

function requirementsTab() {
  // This will be dynamic soon
  const link = { pathname: '/requirements' };
  return React.createElement(
    TabView,
    { active: false, tabName: 'Requirements', key: 'Requirements', link });
}

function PoliciesContainer({ location: { query }, pagedPolicies }) {
  const filters = [
    React.createElement(
      TopicFilterContainer,
      { query, paramName: 'requirements__topics__id__in', key: 'topic' }),
  ];
  const tabs = [
    requirementsTab(),
    React.createElement(
      TabView, { active: true, tabName: 'Policies', key: 'Policies' }),
  ];
  const pageContent = React.createElement(
    PoliciesView,
    { policies: pagedPolicies.results, count: pagedPolicies.count },
  );
  return React.createElement(SearchFilterView, { filters, tabs, pageContent });
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

