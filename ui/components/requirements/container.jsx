import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../api';
import FilterList from '../filter-list';
import Tabs from './tabs';

function Container({ children, topics, policies }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        Search and filter
        <FilterList existingFilters={topics} lookup="topics" />
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
};

Container.propTypes = {
  children: React.PropTypes.element,
  topics: FilterList.propTypes.existingFilters,
  policies: FilterList.propTypes.existingFilters,
};

const fetchTopics = ({ location: { query: { topics__id__in } } }) =>
  api.topics.withIds(topics__id__in);
const fetchPolicies = ({ location: { query: { policy_id__in } } }) =>
  api.policies.withIds(policy_id__in);

export default resolve({
  topics: fetchTopics,
  policies: fetchPolicies,
})(Container);
