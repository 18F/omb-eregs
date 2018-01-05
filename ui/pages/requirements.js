import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';

import wrapPage from '../components/app-wrapper';
import RequirementsView from '../components/requirements/requirements-view';
import SearchFilterView from '../components/search-filter-view';
import TabView from '../components/tab-view';
import ExistingFilters from '../components/filters/existing-container';
import FilterListView from '../components/filters/list-view';
import SelectorContainer from '../components/filters/selector';
import { requirementsData } from '../util/api/queries';
import pageTitle from '../util/page-title';

export function PoliciesTab({ router }) {
  const reqQuery = router.query;
  // Transform filter keys into the format expected by policies
  const policyQuery = {};
  Object.keys(reqQuery).forEach((key) => {
    if (key.startsWith('policy__')) {
      policyQuery[key.slice('policy__'.length)] = reqQuery[key];
    } else if (!['page', 'ordering', 'format'].includes(key)) {
      policyQuery[`requirements__${key}`] = reqQuery[key];
    }
  });
  return <TabView active={false} params={policyQuery} route="policies" tabName="Policies" />;
}
PoliciesTab.propTypes = {
  router: PropTypes.shape({
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};
const PoliciesTabWithRouter = withRouter(PoliciesTab);

const fieldNames = {
  agencies: 'all_agencies__id__in',
  policies: 'policy__id__in',
  search: 'req_text__search',
  topics: 'topics__id__in',
};

export function RequirementsContainer({
  existingAgencies,
  existingPolicies,
  existingTopics,
  pagedReqs,
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
          route="requirements"
        />
      }
    />,
  ];
  const tabs = (
    <div className="tab-container no-print">
      <span className="mr4">View:</span>
      <ul className="organize-tabs list-reset inline-block">
        <TabView active tabName="Requirements" key="Requirements" />
        <PoliciesTabWithRouter key="Policies" />
      </ul>
    </div>
  );
  return (
    <React.Fragment>
      { pageTitle('Requirement Search Results') }
      <SearchFilterView
        filterControls={filterControls}
        pageContent={<RequirementsView requirements={pagedReqs.results} count={pagedReqs.count} />}
        selectedFilters={
          <ExistingFilters
            agencies={existingAgencies}
            fieldNames={fieldNames}
            policies={existingPolicies}
            route="requirements"
            topics={existingTopics}
          />
        }
        tabs={tabs}
      />
    </React.Fragment>
  );
}
RequirementsContainer.propTypes = {
  existingAgencies: ExistingFilters.propTypes.agencies,
  existingPolicies: ExistingFilters.propTypes.policies,
  existingTopics: ExistingFilters.propTypes.topics,
  pagedReqs: PropTypes.shape({
    results: RequirementsView.propTypes.requirements,
    count: RequirementsView.propTypes.count,
  }),
};
RequirementsContainer.defaultProps = {
  existingAgencies: [],
  existingPolicies: [],
  existingTopics: [],
  pagedReqs: { results: [], count: 0 },
};

export default wrapPage(RequirementsContainer, requirementsData);
