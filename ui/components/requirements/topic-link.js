import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../../routes';

export default function TopicLink({ topic }) {
  const route = topic.route ? topic.route : 'requirements';
  return (
    <li className="inline">
      <Link route={route} params={{ topics__id__in: topic.id }}>
        <a>{topic.name}</a>
      </Link>
    </li>
  );
}

const topicParams = {
  id: PropTypes.number,
  name: PropTypes.string,
  route: PropTypes.string,
};

TopicLink.propTypes = {
  topic: PropTypes.shape(topicParams).isRequired,
};
