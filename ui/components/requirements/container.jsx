import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../api';
import FilterList from '../filter-list';
import Tabs from './tabs';

function Container({ children, topics }) {
  return (
    <div className="clearfix">
      <div className="col col-2 p2">
        Search and filter
        <FilterList existingFilters={topics} lookup="topics" />
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
};

Container.propTypes = {
  children: React.PropTypes.element,
  topics: FilterList.propTypes.existingFilters,
};

const fetchTopics = ({ location: { query: { topics__id__in } } }) =>
  api.topics.withIds(topics__id__in);

export default resolve({
  topics: fetchTopics,
})(Container);
