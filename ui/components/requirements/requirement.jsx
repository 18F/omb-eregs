import React from 'react';

export default function Requirement({ requirement }) {
  return (
    <li className="req border rounded p2 mb2 clearfix max-width-3">
      <div className="req-id col col-1 mb2">
        {requirement.req_id}
      </div>
      <div className="req-text col col-11">
        { requirement.req_text.split('\n').map(line => (
          <span key={line} className="req-text-line mb1">{ line }<br /></span>
          ))}
        <div className="clearfix mt3">
          <span className="applies-to mr2">
            Applies to: [not implemented]
          </span>
          <span className="sunset-date">
            Sunset date by { requirement.policy.sunset || 'none' }
          </span>
        </div>
      </div>
    </li>
  );
}

Requirement.defaultProps = {
  requirement: {
    policy: {},
    req_text: '',
    req_id: '',
  },
};

Requirement.propTypes = {
  requirement: React.PropTypes.shape({
    policy: React.PropTypes.shape({
      sunset: React.PropTypes.string,
    }),
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string,
  }),
};
