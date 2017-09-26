import PropTypes from 'prop-types';
import React from 'react';

import { wrapWithAjaxLoader } from '../components/ajax-loading';
import HeaderFooter from '../components/header-footer';
import RequirementsView from '../components/requirements/requirements-view';
import SearchFilterView from '../components/search-filter-view';
import TabView from '../components/tab-view';
import ExistingFilters from '../components/filters/existing-container';
import FilterListView from '../components/filters/list-view';
import Selector from '../components/filters/selector';
import { requirementsData } from '../queries';

function policiesTab(reqQuery) {
  // Transform filter keys into the format expected by policies
  const policyQuery = {};
  Object.keys(reqQuery).forEach((key) => {
    if (key.startsWith('policy__')) {
      policyQuery[key.slice('policy__'.length)] = reqQuery[key];
    } else if (!['page', 'ordering', 'format'].includes(key)) {
      policyQuery[`requirements__${key}`] = reqQuery[key];
    }
  });
  const link = { pathname: '/policies', query: policyQuery };
  return React.createElement(
    TabView,
    { active: false, tabName: 'Policies', key: 'Policies', link });
}

const fieldNames = {
  agencies: 'all_agencies__id__in',
  policies: 'policy__id__in',
  search: 'req_text__search',
  topics: 'topics__id__in',
};

export function RequirementsContainer({
  existingAgencies, existingPolicies, existingTopics, location: { query },
  pagedReqs }) {
  const filterControls = [
    <FilterListView
      heading="Topics"
      headingLabel="topics_label"
      key="topic"
      selector={
        <Selector
          aria-labelledby="topics_label"
          insertParam={fieldNames.topics}
          lookup="topics"
          route="requirements"
        />
      }
    />,
  ];
  return (
    <SearchFilterView
      filterControls={filterControls}
      pageContent={
        <RequirementsView
          requirements={pagedReqs.results}
          count={pagedReqs.count}
        />}
      selectedFilters={
        <ExistingFilters
          agencies={existingAgencies}
          fieldNames={fieldNames}
          policies={existingPolicies}
          route="requirements"
          topics={existingTopics}
        />}
      tabs={[
        <TabView active tabName="Requirements" key="Requirements" />,
        policiesTab(query),
      ]}
    />
  );
}
RequirementsContainer.propTypes = {
  existingAgencies: ExistingFilters.propTypes.agencies,
  existingPolicies: ExistingFilters.propTypes.policies,
  existingTopics: ExistingFilters.propTypes.topics,
  location: PropTypes.shape({ query: PropTypes.shape({}) }),
  pagedReqs: PropTypes.shape({
    results: RequirementsView.propTypes.requirements,
    count: RequirementsView.propTypes.count,
  }),
};
RequirementsContainer.defaultProps = {
  existingAgencies: [],
  existingPolicies: [],
  existingTopics: [],
  location: { query: {} },
  pagedReqs: { results: [], count: 0 },
};

const RequirementsWithHeaderFooter = props =>
  <HeaderFooter><RequirementsContainer {...props} /></HeaderFooter>;

export default wrapWithAjaxLoader(RequirementsWithHeaderFooter, requirementsData);
