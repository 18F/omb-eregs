import React from 'react';
import { resolve } from 'react-resolver';

import FilterRemoveView from './remove-view';
import api from '../../api';

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
  existing: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  field: React.PropTypes.string.isRequired,
  heading: React.PropTypes.string.isRequired,
  idToRemove: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
};
RemoveLinkContainer.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
      query: React.PropTypes.shape({}),
    }),
  }),
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
    linkToRemove: { pathname, query: modifiedQuery },
    name: existing,
    heading: 'Search',
  });
}
RemoveSearchContainer.propTypes = {
  field: React.PropTypes.string.isRequired,
};
RemoveSearchContainer.contextTypes = RemoveLinkContainer.contextTypes;

export function ExistingFiltersContainer({ agencies, fieldNames, policies, topics }) {
  const topicIds = topics.map(topic => topic.id);
  const topicFilters = topics.map(topic => React.createElement(
    RemoveLinkContainer, {
      existing: topicIds,
      field: fieldNames.topics,
      heading: 'Topic',
      idToRemove: topic.id,
      key: topic.id,
      name: topic.name,
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
    }));

  const searchFilters = [
    React.createElement(RemoveSearchContainer, {
      field: fieldNames.search,
      key: 'search',
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
  agencies: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  })).isRequired,
  fieldNames: React.PropTypes.shape({
    policies: React.PropTypes.string,
    search: React.PropTypes.string,
    topics: React.PropTypes.string,
  }).isRequired,
  policies: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
    title: React.PropTypes.string,
  })).isRequired,
  topics: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  })).isRequired,
};


function fetchTopics({ query, fieldNames }) {
  return api.topics.withIds(query[fieldNames.topics]);
}
function fetchPolicies({ query, fieldNames }) {
  return api.policies.withIds(query[fieldNames.policies]);
}
function fetchAgencies({ query, fieldNames }) {
  return api.agencies.withIds(query[fieldNames.agencies]);
}

export default resolve({
  agencies: fetchAgencies,
  policies: fetchPolicies,
  topics: fetchTopics,
})(ExistingFiltersContainer);
