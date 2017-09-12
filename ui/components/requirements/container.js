import PropTypes from 'prop-types';
import React from 'react';

import RequirementsView from './requirements-view';
import { wrapWithAjaxLoader } from '../ajax-loading';
import SearchFilterView from '../search-filter-view';
import TabView from '../tab-view';
import ExistingFilters from '../filters/existing-container';
import FilterListView from '../filters/list-view';
import Selector from '../filters/selector';
import api from '../../api';

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

export function RequirementsContainer({ location: { query }, pagedReqs }) {
  const filterControls = [
    React.createElement(FilterListView, {
      heading: 'Topics',
      headingLabel: 'topics_label',
      key: 'topic',
      selector: React.createElement(Selector, {
        'aria-labelledby': 'topics_label',
        insertParam: fieldNames.topics,
        lookup: 'topics',
        pathname: '/requirements',
      }),
    }),
    /* Add this back once the data's cleaned up
    React.createElement(FilterListView, {
      heading: 'Agencies',
      key: 'agency',
      selector: React.createElement(Selector, {
        insertParam: fieldNames.agencies,
        lookup: 'agencies',
        pathname: '/requirements',
      }),
    }),
    */
  ];
  const tabs = [
    React.createElement(
      TabView, { active: true, tabName: 'Requirements', key: 'Requirements' }),
    policiesTab(query),
  ];
  const pageContent = React.createElement(
    RequirementsView,
    { requirements: pagedReqs.results, count: pagedReqs.count },
  );
  const selectedFilters = React.createElement(
    ExistingFilters, { fieldNames, query });
  return React.createElement(
    SearchFilterView, { filterControls, pageContent, selectedFilters, tabs });
}
RequirementsContainer.propTypes = {
  location: PropTypes.shape({ query: PropTypes.shape({}) }),
  pagedReqs: PropTypes.shape({
    results: RequirementsView.propTypes.requirements,
    count: RequirementsView.propTypes.count,
  }),
};
RequirementsContainer.defaultProps = {
  location: { query: {} },
  pagedReqs: { results: [], count: 0 },
};

function fetchRequirements({ location: { query } }) {
  return api.requirements.fetch(query);
}

export default wrapWithAjaxLoader(
  RequirementsContainer, { pagedReqs: fetchRequirements });
