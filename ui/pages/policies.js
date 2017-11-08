import PropTypes from 'prop-types';
import React from 'react';
import wrapPage from '../components/app-wrapper';
import ExistingFilters from '../components/filters/existing-container';
import FilterListView from '../components/filters/list-view';
import SelectorContainer from '../components/filters/selector';
import PoliciesView from '../components/policies/policies-view';
import SearchFilterView from '../components/search-filter-view';
import { policiesData } from '../util/api/queries';

const fieldNames = {
  agencies: 'requirements__all_agencies__id__in',
  policies: 'id__in',
  search: 'requirements__req_text__search',
  topics: 'requirements__topics__id__in',
};

export function PoliciesContainer({
  existingAgencies,
  existingPolicies,
  existingTopics,
  pagedPolicies,
}) {
  const filterControls = [
    <FilterListView
      heading="Topics"
      headingLabel="topics_label"
      key="topic"
      selector={
        <SelectorContainer
          aria-labelledby="topics_label"
          insertParam={fieldNames.topics}
          lookup="topics"
          route="policies"
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
          topicsIds={existingTopics.map(t => t.id).join(',')}
        />
      }
      selectedFilters={
        <ExistingFilters
          agencies={existingAgencies}
          fieldNames={fieldNames}
          policies={existingPolicies}
          route="policies"
          topics={existingTopics}
        />
      }
    />
  );
}
PoliciesContainer.propTypes = {
  existingAgencies: ExistingFilters.propTypes.agencies,
  existingPolicies: ExistingFilters.propTypes.policies,
  existingTopics: ExistingFilters.propTypes.topics,
  pagedPolicies: PropTypes.shape({
    results: PoliciesView.propTypes.policies,
    count: PoliciesView.propTypes.count,
  }),
};
PoliciesContainer.defaultProps = {
  existingAgencies: [],
  existingPolicies: [],
  existingTopics: [],
  pagedPolicies: { results: [], count: 0 },
};

export default wrapPage(PoliciesContainer, policiesData);
