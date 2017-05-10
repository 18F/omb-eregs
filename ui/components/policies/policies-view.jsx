import React from 'react';

import Pagers from '../pagers';
import Policy from './policy-view';
import ThingCounter from '../thing-counters';

export default function PoliciesView({ policies, count, topicsIds }) {
  const chunk = 25;
  const singular = 'Policy';
  const plural = 'Policies';

  return (
    <div>
      <ThingCounter count={count} chunk={chunk} singular={singular} plural={plural} />
      <ul className="policy-list list-reset">
        { policies.map(policy =>
          <Policy key={policy.id} policy={policy} topicsIds={topicsIds} />,
        )}
      </ul>
      <Pagers count={count} />
    </div>
  );
}
PoliciesView.propTypes = {
  policies: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
  })),
  count: React.PropTypes.number,
  topicsIds: React.PropTypes.string,
};
PoliciesView.defaultProps = {
  policies: [],
  count: 0,
  topicsIds: '',
};
