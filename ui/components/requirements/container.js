import React from 'react';
import { resolve } from 'react-resolver';

import RequirementsView from './requirements-view';
import SearchFilterView from '../search-filter-view';
import TabView from '../tab-view';
import TopicFilterContainer from '../filters/topic-container';
import api from '../../api';

function policiesTab() {
  // This will be dynamic soon
  const link = { pathname: '/policies' };
  return React.createElement(
    TabView,
    { active: false, tabName: 'Policies', key: 'Policies', link });
}

export function RequirementsContainer({ location: { query }, pagedReqs }) {
  const filters = [
    React.createElement(
      TopicFilterContainer,
      { query, paramName: 'topics__id__in', key: 'topic' }),
  ];
  const tabs = [
    React.createElement(
      TabView, { active: true, tabName: 'Requirements', key: 'Requirements' }),
    policiesTab(),
  ];
  const pageContent = React.createElement(
    RequirementsView,
    { requirements: pagedReqs.results, count: pagedReqs.count },
  );
  return React.createElement(SearchFilterView, { filters, tabs, pageContent });
}
RequirementsContainer.propTypes = {
  location: React.PropTypes.shape({ query: React.PropTypes.shape({}) }),
  pagedReqs: React.PropTypes.shape({
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

export default resolve({
  pagedReqs: fetchRequirements,
})(RequirementsContainer);
