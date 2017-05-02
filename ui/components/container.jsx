import React from 'react';
import { resolve } from 'react-resolver';

import api from '../api';
import FilterList from './filter-list';
import Tabs from './requirements/tabs';

function Container({ children, route, topics, policies }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        Search and filter
        <FilterList
          existingFilters={topics}
          lookup="topics"
          apiFilterLookup={route.apiFilterLookup}
        />
        <FilterList existingFilters={policies} lookup="policies" />
      </div>
      <div className="col col-10 pl4 border-left max-width-3">
        <Tabs />
        { children }
      </div>
    </div>
  );
}

Container.defaultProps = {
  children: null,
  topics: [],
  policies: [],
  route: {},
};

Container.propTypes = {
  children: React.PropTypes.element,
  topics: FilterList.propTypes.existingFilters,
  policies: FilterList.propTypes.existingFilters,
  route: React.PropTypes.shape({
    apiFilterLookup: React.PropTypes.string,
  }),
};

const fetchTopics = ({ location: { query } }) => {
  const ids = query.topics__id__in || query.requirements__topics__id__in;
  return api.topics.withIds(ids);
};
const fetchPolicies = ({ location: { query: { policy_id__in } } }) =>
  api.policies.withIds(policy_id__in);

export default resolve({
  topics: fetchTopics,
  policies: fetchPolicies,
})(Container);
