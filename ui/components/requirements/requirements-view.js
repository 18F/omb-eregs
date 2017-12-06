import PropTypes from 'prop-types';
import React from 'react';

import Requirement from './requirement';
import PagersContainer from '../pagers';
import ThingCounterContainer from '../thing-counters';

export default function RequirementsView({ requirements, count }) {
  const singular = 'requirement';
  const plural = 'requirements';
  return [
    <ThingCounterContainer count={count} key="counter" singular={singular} plural={plural} />,
    <ul className="requirement-list list-reset" key="reqs">
      { requirements.map(requirement => (
        <li key={requirement.req_id} className="gray-border border rounded mb2">
          <Requirement requirement={requirement} />
        </li>
      )) }
    </ul>,
    <PagersContainer count={count} key="pager" route="requirements" />,
  ];
}
const requirementProps = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  relevant_reqs: PropTypes.number,
});
RequirementsView.propTypes = {
  requirements: PropTypes.arrayOf(requirementProps),
  count: PropTypes.number,
};
RequirementsView.defaultProps = {
  requirements: [],
  count: 0,
};
