import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

function Requirement(props) {
  return <li>{props.req_id}: {props.req_text}</li>;
}

function Requirements(props) {
  return (
    <div>
      <h1>Requirements</h1>
      <h2>{props.location.query.keywords__name__in}</h2>
      <ul>
        {props.data.map(requirement =>
          <Requirement req_text={requirement.req_text} req_id={requirement.req_id} />)}
      </ul>
    </div>
  );
}

Requirements.defaultProps = {
  data: [],
  location: {},
};

Requirements.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.shape({
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string,
  })),
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({
      keywords__name__in: React.PropTypes.string,
    }),
  }),
};

Requirement.defaultProps = {
  req_text: null,
  req_id: null,
  location: {},
};

Requirement.propTypes = {
  req_text: React.PropTypes.string,
  req_id: React.PropTypes.string,
};

export default resolve(
  'data',
  props => axios.get('https://omb-eregs-api-demo.app.cloud.gov/requirements/', { params: props.location.query }).then(({ data }) => data),
)(Requirements);
