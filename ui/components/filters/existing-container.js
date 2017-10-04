import PropTypes from 'prop-types';
import React from 'react';

/* eslint-disable import/no-named-as-default */
import RemoveLinkContainer from './remove-link-container';
import RemoveSearchContainer from './remove-search-container';
/* eslint-enable import/no-named-as-default */

export default function ExistingFiltersContainer({
  agencies,
  fieldNames,
  policies,
  route,
  topics,
}) {
  const topicIds = topics.map(topic => topic.id);
  const topicFilters = topics.map(topic => (
    <RemoveLinkContainer
      existing={topicIds}
      field={fieldNames.topics}
      heading="Topic"
      idToRemove={topic.id}
      key={topic.id}
      name={topic.name}
      route={route}
    />
  ));

  const policyIds = policies.map(policy => policy.id);
  const policyFilters = policies.map(policy => (
    <RemoveLinkContainer
      existing={policyIds}
      field={fieldNames.policies}
      heading="Policy"
      idToRemove={policy.id}
      key={policy.id}
      name={policy.title_with_number}
      route={route}
    />
  ));

  const searchFilters = [
    <RemoveSearchContainer field={fieldNames.search} key="search" route={route} />,
  ];

  const agencyIds = agencies.map(agency => agency.id);
  const agencyFilters = agencies.map(agency => (
    <RemoveLinkContainer
      existing={agencyIds}
      field={fieldNames.agencies}
      heading="Agency"
      idToRemove={agency.id}
      key={agency.id}
      name={agency.name}
    />
  ));

  const filters = [].concat(topicFilters, policyFilters, agencyFilters, searchFilters);

  return <ol className="list-reset">{filters}</ol>;
}

ExistingFiltersContainer.propTypes = {
  agencies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
  fieldNames: PropTypes.shape({
    policies: PropTypes.string,
    search: PropTypes.string,
    topics: PropTypes.string,
  }).isRequired,
  policies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
    }),
  ).isRequired,
  route: PropTypes.string.isRequired,
  topics: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
};
