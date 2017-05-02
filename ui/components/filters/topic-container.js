import React from 'react';
import { resolve } from 'react-resolver';

import FilterListView from './list-view';
import Autocompleter from './autocompleter';
import api from '../../api';

function TopicContainer({ paramName }) {
  const autocompleter = React.createElement(
    Autocompleter, { insertParam: paramName, lookup: 'topics' });
  return React.createElement(FilterListView, {
    heading: 'Topics', removeLinks: [], autocompleter });
}
TopicContainer.propTypes = {
  paramName: React.PropTypes.string.isRequired,
};


function fetchTopics({ query, paramName }) {
  return api.topics.withIds(query[paramName]);
}

export default resolve({
  existingTopics: fetchTopics,
})(TopicContainer);
