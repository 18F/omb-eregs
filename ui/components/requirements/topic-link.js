import PropTypes from 'prop-types';
import React from 'react';

import { Link } from '../../routes';

export default function TopicLink({ topic }) {
  return (
    <li className="inline">
      <Link route="requirements" params={{ topics__id__in: topic.id }}>
        <a>{topic.name}</a>
      </Link>
    </li>
  );
}

TopicLink.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }).isRequired,
};
