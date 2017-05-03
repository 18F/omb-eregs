import React from 'react';

import Pagers from '../pagers';
import Policy from './policy-view';

export default function PoliciesView({ policies, count, query }) {
  return (
    <div>
      <ul className="list-reset">
        { policies.map(policy =>
          <Policy key={policy.id} policy={policy} query={query} />,
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
  query: React.PropTypes.shape({}),
};
PoliciesView.defaultProps = {
  policies: [],
  count: 0,
  query: {},
};
