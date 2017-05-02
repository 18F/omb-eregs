import React from 'react';
import { resolve } from 'react-resolver';

import PoliciesView from './policies-view';
import SearchFilterView from '../search-filter-view';
import TabView from '../tab-view';
import api from '../../api';

function requirementsTab() {
  // This will be dynamic soon
  const link = { pathname: '/requirements' };
  return React.createElement(
    TabView, { active: false, tabName: 'Requirements', link });
}

function PoliciesContainer({ pagedPolicies }) {
  const filters = [];
  const tabs = [
    requirementsTab(),
    React.createElement(TabView, { active: true, tabName: 'Policies' }),
  ];
  const pageContent = React.createElement(
    PoliciesView,
    { policies: pagedPolicies.results, count: pagedPolicies.count },
  );
  return React.createElement(SearchFilterView, { filters, tabs, pageContent });
}
PoliciesContainer.propTypes = {
  pagedPolicies: React.PropTypes.shape({
    results: PoliciesView.propTypes.policies,
    count: PoliciesView.propTypes.count,
  }),
};
PoliciesContainer.defaultProps = {
  pagedPolicies: { results: [], count: 0 },
};

function fetchPolicies({ location: { query } }) {
  const params = Object.assign({ ordering: 'policy_number' }, query);
  return api.policies.fetch(params);
}

export default resolve({
  pagedPolicies: fetchPolicies,
})(PoliciesContainer);

