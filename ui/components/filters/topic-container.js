import React from 'react';
import { resolve } from 'react-resolver';

import FilterListView from './list-view';
import FilterRemoveView from './remove-view';
import Autocompleter from './autocompleter';
import api from '../../api';

function removeLinks(existingTopics, paramName, pathname, query) {
  const currentIds = existingTopics.map(topic => topic.id);
  return existingTopics.map((topic) => {
    const remainingIds = currentIds.filter(id => id !== topic.id);
    const modifiedQuery = Object.assign({}, query, {
      [paramName]: remainingIds.join(','),
    });
    delete modifiedQuery.page;

    return React.createElement(FilterRemoveView, {
      key: topic.id,
      linkToRemove: { pathname, query: modifiedQuery },
      name: topic.name,
    });
  });
}

function TopicContainer({ existingTopics, paramName }, { router }) {
  const { location: { pathname, query } } = router;
  const autocompleter = React.createElement(
    Autocompleter, { insertParam: paramName, lookup: 'topics' });
  return React.createElement(FilterListView, {
    autocompleter,
    heading: 'Topics',
    removeLinks: removeLinks(existingTopics, paramName, pathname, query) });
}
TopicContainer.propTypes = {
  paramName: React.PropTypes.string.isRequired,
  existingTopics: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string,
    id: React.PropTypes.number,
  })),
};
TopicContainer.defaultProps = {
  existingTopics: [],
};
TopicContainer.contextTypes = {
  router: React.PropTypes.shape({
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
      query: React.PropTypes.shape({}),
    }),
  }),
};


function fetchTopics({ query, paramName }) {
  return api.topics.withIds(query[paramName]);
}

export default resolve({
  existingTopics: fetchTopics,
})(TopicContainer);
