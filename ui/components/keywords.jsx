import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';
import { Link } from 'react-router';

function Keyword(props) {
  return <li>{props.keyword}</li>;
}

function Keywords(props) {
  return (
    <div>
      <h1>Keywords</h1>
      <ul>
        {props.data.map(keyword => <Link to={{ pathname: '/requirements/', query: { keywords__name__in: keyword.name } }}><Keyword keyword={keyword.name} /></Link>)}
      </ul>
    </div>
  );
}

Keywords.defaultProps = {
  data: [],
};

Keywords.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string,
    keyword: React.PropTypes.string,
  })),
};

Keyword.defaultProps = {
  keyword: null,
};

Keyword.propTypes = {
  keyword: React.PropTypes.string,
};

export default resolve(
  'data',
  () => axios.get('https://omb-eregs-api-demo.app.cloud.gov/keywords/').then(({ data }) => data),
)(Keywords);
