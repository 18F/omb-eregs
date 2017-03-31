import React from 'react';
import { resolve } from 'react-resolver';

import { theApi } from '../../globals';
import Pagers from '../pagers';
import Requirement from './requirement';

function ByKeyword({ pagedReqs, location }) {
  return (
    <div>
      <ul className="list-reset">
        { pagedReqs.results.map(requirement =>
          <li key={requirement.req_id} className="gray-border border rounded mb2">
            <Requirement requirement={requirement} />
          </li>) }
      </ul>
      <Pagers location={location} count={pagedReqs.count} />
    </div>
  );
}
ByKeyword.defaultProps = {
  pagedReqs: { results: [], count: 0 },
  location: {},
};
ByKeyword.propTypes = {
  location: React.PropTypes.shape({}),
  pagedReqs: React.PropTypes.shape({
    results: React.PropTypes.arrayOf(React.PropTypes.shape({
      req_text: React.PropTypes.string,
      req_id: React.PropTypes.string,
    })),
    count: React.PropTypes.number,
  }),
};

const fetchRequirements = ({ location: { query } }) =>
  theApi().requirements.fetch(query);

export default resolve(
  'pagedReqs', fetchRequirements,
)(ByKeyword);
