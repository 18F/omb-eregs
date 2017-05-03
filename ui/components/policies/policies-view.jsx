import React from 'react';

import Pagers from '../pagers';
import Policy from './policy-view';

export default function PoliciesView({ policies, count, topicsIds }) {
  return (
    <div>
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
