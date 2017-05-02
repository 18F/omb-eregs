import React from 'react';

import Pagers from '../pagers';

export default function PoliciesView({ policies, count }) {
  return (
    <div>
      <ul className="list-reset">
        { policies.map(policy =>
          <li key={policy.id}>{policy.title} {policy.relevant_reqs}</li>)}
      </ul>
      <Pagers count={count} />
    </div>
  );
}
PoliciesView.propTypes = {
  policies: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number,
    title: React.PropTypes.string,
    relevant_reqs: React.PropTypes.number,
  })),
  count: React.PropTypes.number,
};
PoliciesView.defaultProps = {
  policies: [],
  count: 0,
};
