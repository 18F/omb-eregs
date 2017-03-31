import React from 'react';

export default function Requirement({ requirement }) {
  return (
    <div className="req border rounded p2 mb2 clearfix max-width-3">
      <div className="req-id col col-1 mb2 mr1">
        {requirement.req_id}
      </div>
      <div className="req-text col col-10">
        { requirement.req_text.split('\n').map(line => (
          <span key={line} className="req-text-line mb1">{ line }<br /></span>
          ))}
        <div className="clearfix mt3">
          <div className="applies-to mr2">
            Applies to: [not implemented]
          </div>
          <div className="sunset-date">
            Sunset date by { requirement.policy.sunset || 'none' }
          </div>
          <div className="topics">
            <span>Topics: </span>
            <ul className="topics-list list-reset inline">
              { requirement.keywords.map((keyword, index, keywords) => (
                <li key={keyword} className="inline">
                  { keyword }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
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
