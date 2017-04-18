import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';

import api from '../api';
import Pagers from './pagers';

function Topic({ topic }) {
  return (
    <li>
      <Link to={{ pathname: '/requirements/by-topic', query: { topics__id__in: topic.id } }} >{ topic.name }</Link>
    </li>
  );
}

Topic.defaultProps = {
  topic: {},
};
Topic.propTypes = {
  topic: React.PropTypes.shape({
    id: React.PropTypes.number,
    name: React.PropTypes.string,
  }),
};


function Topics({ location, data }) {
  return (
    <div>
      <h1>Topics</h1>
      <ul>
        { data.results.map(topic => <Topic key={topic.id} topic={topic} />) }
      </ul>
      <Pagers location={location} count={data.count} />
    </div>
  );
}

Topics.defaultProps = {
  data: { results: [], count: 0 },
  location: {},
};

Topics.propTypes = {
  data: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(Topic.propTypes.topic),
    count: React.PropTypes.number,
  }),
  location: React.PropTypes.shape({}),
};

const fetchTopics = ({ location: { query } }) =>
  api.topics.fetch(query);

export default resolve(
  'data', fetchTopics,
)(Topics);
