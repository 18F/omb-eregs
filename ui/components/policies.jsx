import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';

import api from '../api';
import Pagers from './pagers';

function Policy({ policy }) {
  return (
    <li>
      <Link to={{ pathname: '/requirements/by-policy', query: { policy_id: policy.id } }} >{ policy.policy_number }: { policy.title }</Link>
    </li>
  );
}

Policy.defaultProps = {
  policy: {},
};
Policy.propTypes = {
  policy: React.PropTypes.shape({
    id: React.PropTypes.number,
    policy_number: React.PropTypes.number,
    title: React.PropTypes.string,
  }),
};

function Policies({ location, data }) {
  return (
    <div>
      <h1>Policies</h1>
      <ul>
        { data.results.map(policy => <Policy key={policy.id} policy={policy} />) }
      </ul>
      <Pagers location={location} count={data.count} />
    </div>
  );
}

Policies.defaultProps = {
  data: { results: [], count: 0 },
  location: {},
};
Policies.propTypes = {
  data: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(Policy.propTypes.policy),
    count: React.PropTypes.number,
  }),
  location: React.PropTypes.shape({}),
};

const fetchPolicies = ({ location: { query } }) =>
  api.policies.fetch(query);

export default resolve(
  'data', fetchPolicies,
)(Policies);

