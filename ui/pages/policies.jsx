import PropTypes from 'prop-types';
import React from 'react';

import App from '../components/app';
import PoliciesView from '../components/policies/policies-view';
import SearchFilterView from '../components/search-filter-view';
import TabView from '../components/tab-view';
import ExistingFilters from '../components/filters/existing-container';
import FilterListView from '../components/filters/list-view';
import Selector from '../components/filters/selector';
import { wrapWithAjaxLoader } from '../components/ajax-loading';
import api from '../api';

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
  return (
    <TabView active={false} tabName="Requirements" key="Requirements" link={link} />
  );
}

const fieldNames = {
  agencies: 'requirements__all_agencies__id__in',
  policies: 'id__in',
  search: 'requirements__req_text__search',
  topics: 'requirements__topics__id__in',
};

export function PoliciesContainer({ location: { query }, pagedPolicies }) {
  const filterControls = [
    <FilterListView
      heading="Topics"
      headingLabel="topics_label"
      key="topic"
      selector={
        <Selector
          arial-labelledby="topics_label"
          insertParam={fieldNames.topics}
          lookup="topics"
          pathname="/policies"
        />
      }
    />,
  ];
  return (
    <SearchFilterView
      filterControls={filterControls}
      pageContent={
        <PoliciesView
          policies={pagedPolicies.results}
          count={pagedPolicies.count}
          topicsIds={query.requirements__topics__id__in}
        />}
      selectedFilters={<ExistingFilters fieldNames={fieldNames} query={query} />}
      tabs={[
        requirementsTab(query),
        <TabView active tabName="Policies" key="Policies" />,
      ]}
    />
  );
}
PoliciesContainer.propTypes = {
  location: PropTypes.shape({ query: PropTypes.shape({}) }),
  pagedPolicies: PropTypes.shape({
    results: PoliciesView.propTypes.policies,
    count: PoliciesView.propTypes.count,
  }),
};
PoliciesContainer.defaultProps = {
  location: { query: {} },
  pagedPolicies: { results: [], count: 0 },
};
const PoliciesWithApp = props => <App><PoliciesContainer {...props} /></App>;

function fetchPolicies({ location: { query } }) {
  const params = Object.assign({ ordering: 'policy_number' }, query);
  return api.policies.fetch(params);
}

export default wrapWithAjaxLoader(
  PoliciesWithApp, { pagedPolicies: fetchPolicies });

