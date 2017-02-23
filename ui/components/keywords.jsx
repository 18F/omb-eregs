import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

function Keyword(props) {
  return <li>{props.keyword}</li>
}

function Keywords(props) {
  return (
    <div>
      <h1>Keywords</h1>
      <ul>
        {props.data.map((keyword) => <Keyword keyword={keyword.name} />)}
      </ul>
    </div>
  );
}

Keywords.defaultProps = {
  children: null,
  data: [],
};

Keywords.propTypes = {
  children: React.PropTypes.node,
  data: React.PropTypes.arrayOf(React.PropTypes.shape({ name: React.PropTypes.string })),
};

export default resolve(
  'data',
  () => axios.get('https://omb-eregs-api-demo.app.cloud.gov/keywords/').then(({ data }) => data),
)(Keywords);
