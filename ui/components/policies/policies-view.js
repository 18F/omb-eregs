import PropTypes from 'prop-types';
import React from 'react';

import PagersContainer from '../pagers';
import Policy from './policy-view';
import ThingCounterContainer from '../thing-counters';

export default function PoliciesView({ policies, count, topicsIds }) {
  const singular = 'policy';
  const plural = 'policies';

  return (
    <div>
      <ThingCounterContainer count={count} singular={singular} plural={plural} />
      <ul className="policy-list list-reset">
        { policies.map(policy =>
          <Policy key={policy.id} policy={policy} topicsIds={topicsIds} />,
        )}
      </ul>
      <PagersContainer count={count} route="policies" />
    </div>
  );
}
PoliciesView.propTypes = {
  policies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })),
  count: PropTypes.number,
  topicsIds: PropTypes.string,
};
PoliciesView.defaultProps = {
  policies: [],
  count: 0,
  topicsIds: '',
};
