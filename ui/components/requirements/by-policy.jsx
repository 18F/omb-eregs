import React from 'react';
import { resolve } from 'react-resolver';

import api from '../../api';
import Pagers from '../pagers';
import Requirement from './requirement';

export function Group({ group }) {
  if (group.length === 0) {
    return null;
  }

  const policy = group[0].policy;
  return (
    <div className="gray-border border mb2 p2 rounded">
      <h4>{policy.title}</h4>
      <ol className="gray-border list-reset border-top">
        { group.map(req =>
          <li key={req.req_id} className="gray-border border-bottom">
            <Requirement requirement={req} />
          </li>) }
      </ol>
      <div className="clearfix">
        <a href={policy.uri} className="center block">Read the whole policy</a>
      </div>
    </div>
  );
}
Group.defaultProps = {
  group: [],
};
Group.propTypes = {
  group: React.PropTypes.arrayOf(React.PropTypes.shape({
    req_id: React.PropTypes.string,
    policy: React.PropTypes.shape({
      title: React.PropTypes.string,
    }),
  })),
};

export function groupReqs(requirements) {
  const groups = [];
  let lastPolicy = null;
  requirements.forEach((req) => {
    if (lastPolicy !== req.policy.id) {
      lastPolicy = req.policy.id;
      groups.push([]);
    }
    groups[groups.length - 1].push(req);
  });
  return groups;
}

function ByPolicy({ pagedReqs }) {
  const groups = groupReqs(pagedReqs.results);
  return (
    <div>
      <ul className="list-reset">
        { groups.map(group =>
          <li key={group[0].policy.id}><Group group={group} /></li>)}
      </ul>
      <Pagers count={pagedReqs.count} />
    </div>
  );
}
ByPolicy.defaultProps = {
  pagedReqs: { results: [], count: 0 },
};

ByPolicy.propTypes = {
  pagedReqs: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      req_text: React.PropTypes.string,
      req_id: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
};

const fetchRequirements = ({ location: { query } }) => {
  const params = Object.assign({}, query, { ordering: 'policy__policy_number' });
  return api.requirements.fetch(params);
};

export default resolve(
  'pagedReqs', fetchRequirements,
)(ByPolicy);