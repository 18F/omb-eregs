import React from 'react';
import { resolve } from 'react-resolver';
import { withRouter } from 'react-router';

import { theApi } from '../../globals';
import FilterList from '../filter-list';
import Tabs from './tabs';

function Container({ children, keywords, policies, router }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        <FilterList existingFilters={keywords} lookup="keywords" router={router} />
        <FilterList existingFilters={policies} lookup="policies" router={router} />
      </div>
      <div className="col col-10 pl4 border-left">
        <Tabs router={router} />
        { children }
      </div>
    </div>
  );
}

Container.defaultProps = {
  children: null,
  keywords: [],
  policies: [],
  router: {},
};

Container.propTypes = {
  children: React.PropTypes.element,
  keywords: FilterList.propTypes.existingFilters,
  policies: FilterList.propTypes.existingFilters,
  router: React.PropTypes.shape({}),
};

const fetchKeywords = ({ location: { query: { keywords__id__in } } }) =>
  theApi().keywords.withIds(keywords__id__in);
const fetchPolicies = ({ location: { query: { policy_id__in } } }) =>
  theApi().policies.withIds(policy_id__in);

export default resolve({
  keywords: fetchKeywords,
  policies: fetchPolicies,
})(withRouter(Container));
