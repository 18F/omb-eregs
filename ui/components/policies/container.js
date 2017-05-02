import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../api';
import SearchFilterView from '../search-filter-view';

function PolicyContainer() {
  const filters = [];
  const tabs = [];
  const pageContent = null;
  return React.createElement(SearchFilterView, { filters, tabs, pageContent });
}

function fetchPolicies({ location: { query } }) {
  const params = Object.assign({ ordering: 'policy_number' }, query);
  return api.policies.fetch(params);
}

export default resolve({
  pagedPolicies: fetchPolicies,
})(PolicyContainer);

