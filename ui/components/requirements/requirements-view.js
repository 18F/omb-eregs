import PropTypes from 'prop-types';
import React from 'react';
import PagersContainer from '../pagers';
import ThingCounterContainer from '../thing-counters';
import Requirement from './requirement';

export default function RequirementsView({ requirements, count }) {
  const singular = 'requirement';
  const plural = 'requirements';
  return (
    <div>
      <ThingCounterContainer count={count} singular={singular} plural={plural} />
      <ul className="requirement-list list-reset">
        { requirements.map(requirement => (
          <li key={requirement.req_id} className="gray-border border rounded mb2">
            <Requirement requirement={requirement} />
          </li>
        )) }
      </ul>
      <PagersContainer count={count} route="requirements" />
    </div>
  );
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
