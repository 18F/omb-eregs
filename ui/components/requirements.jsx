import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

function Requirement(props) {
  return <li>{props.req_id}: {props.req_text}</li>
}

function Requirements(props) {
  return (
    <div>
      <h1>Requirements</h1>
      <ul>
        {props.data.map((requirement) => <Requirement req_text={requirement.req_text} req_id={requirement.req_id} />)}
      </ul>
    </div>
  );
}

Requirements.defaultProps = {
  children: null,
  data: [],
};

Requirements.propTypes = {
  children: React.PropTypes.node,
  data: React.PropTypes.arrayOf(React.PropTypes.shape({
    req_text: React.PropTypes.string,
    req_id: React.PropTypes.string
  })),
};

export default resolve(
  'data',
  (props) => axios.get(`https://omb-eregs-api-demo.app.cloud.gov/requirements/?req_id=${props.params.req_id}`).then(({ data }) => data),
)(Requirements);
