import PropTypes from 'prop-types';
import React from 'react';

import FilterRemoveView from './remove-view';

export function RemoveLinkContainer(
  { existing, field, heading, idToRemove, name },
  { router: { location: { pathname, query } } }) {
  const remaining = existing.filter(id => id !== idToRemove);
  const modifiedQuery = Object.assign({}, query, {
    [field]: remaining.join(','),
  });
  delete modifiedQuery.page;

  return React.createElement(FilterRemoveView, {
    linkToRemove: { pathname, query: modifiedQuery },
    name,
    heading,
  });
}
RemoveLinkContainer.propTypes = {
  existing: PropTypes.arrayOf(PropTypes.number).isRequired,
  field: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  idToRemove: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  router: PropTypes.shape({
    query: PropTypes.shape({}).isRequired,
  }).isRequired,
};

export function RemoveSearchContainer(
  { field }, { router: { location: { pathname, query } } }) {
  const existing = query[field];
  if (!existing) {
    return null;
  }

  const modifiedQuery = Object.assign({}, query);
  delete modifiedQuery[field];
  delete modifiedQuery.page;

  return React.createElement(FilterRemoveView, {
    heading: 'Search',
    name: existing,
    params: modifiedQuery,
    route,
  });
}
RemoveSearchContainer.propTypes = {
  field: PropTypes.string.isRequired,
};
RemoveSearchContainer.contextTypes = RemoveLinkContainer.contextTypes;

export default function ExistingFiltersContainer({
  agencies, fieldNames, policies, route, topics }) {
  const topicIds = topics.map(topic => topic.id);
  const topicFilters = topics.map(topic => React.createElement(
    RemoveLinkContainer, {
      existing: topicIds,
      field: fieldNames.topics,
      heading: 'Topic',
      idToRemove: topic.id,
      key: topic.id,
      name: topic.name,
      route,
    }));

  const policyIds = policies.map(policy => policy.id);
  const policyFilters = policies.map(policy => React.createElement(
    RemoveLinkContainer, {
      existing: policyIds,
      field: fieldNames.policies,
      heading: 'Policy',
      idToRemove: policy.id,
      key: policy.id,
      name: policy.title,
      route,
    }));

  const searchFilters = [
    React.createElement(RemoveSearchContainer, {
      field: fieldNames.search,
      key: 'search',
      route,
    }),
  ];

  const agencyIds = agencies.map(agency => agency.id);
  const agencyFilters = agencies.map(agency => React.createElement(
    RemoveLinkContainer, {
      existing: agencyIds,
      field: fieldNames.agencies,
      heading: 'Agency',
      idToRemove: agency.id,
      key: agency.id,
      name: agency.name,
    }));

  const filters = [].concat(topicFilters, policyFilters, agencyFilters, searchFilters);

  return React.createElement('ol', { className: 'list-reset' }, filters);
}
ExistingFiltersContainer.propTypes = {
  agencies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  })).isRequired,
  fieldNames: PropTypes.shape({
    policies: PropTypes.string,
    search: PropTypes.string,
    topics: PropTypes.string,
  }).isRequired,
  policies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
  })).isRequired,
  route: PropTypes.string.isRequired,
  topics: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  })).isRequired,
};
