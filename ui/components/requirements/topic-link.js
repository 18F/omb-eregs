import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../../routes';

export default function TopicLink({ topic }) {
  const route = topic.route ? topic.route : 'requirements';
  return(
    <li className="inline">
      <Link route={route} params={{ topics__id__in: topic.id }}>
        <a>{topic.name}</a>
      </Link>
    </li>
  );
}

TopicLink.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    route: PropTypes.string,
  }).isRequired,
};