import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../api';
import FilterList from '../filter-list';
import Tabs from './tabs';

function Container({ children, keywords, policies }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        Search and filter
        <FilterList existingFilters={keywords} lookup="keywords" />
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
  keywords: [],
  policies: [],
};

Container.propTypes = {
  children: React.PropTypes.element,
  keywords: FilterList.propTypes.existingFilters,
  policies: FilterList.propTypes.existingFilters,
};

const fetchKeywords = ({ location: { query: { keywords__id__in } } }) =>
  api.keywords.withIds(keywords__id__in);
const fetchPolicies = ({ location: { query: { policy_id__in } } }) =>
  api.policies.withIds(policy_id__in);

export default resolve({
  keywords: fetchKeywords,
  policies: fetchPolicies,
})(Container);
