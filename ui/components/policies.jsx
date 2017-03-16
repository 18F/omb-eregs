import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';

import { apiUrl } from '../globals';
import Pagers from './pagers';

function Policy({ policy }) {
  return (
    <li>
      <Link to={{ pathname: '/requirements/', query: { policy_id: policy.id } }} >{ policy.policy_number }: { policy.title }</Link>
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

export default resolve(
  'data',
  ({ location: { query } }) =>
    axios.get(`${apiUrl()}policies/`, { params: query }).then(({ data }) => data),
)(Policies);

