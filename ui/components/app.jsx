import axios from 'axios';
import React from 'react';
import { resolve } from 'react-resolver';

function App(props) {
  return (
    <div>
      <p>{JSON.stringify(props.data)}</p>
      <h1>App</h1>
      {props.children}
    </div>
  );
}

App.defaultProps = {
  children: null,
};

App.propTypes = {
  children: React.PropTypes.node,
};

export default resolve(
  'data',
  () => axios.get('https://omb-eregs-dev.app.cloud.gov/taggit_autosuggest/list/reqs.keyword/').then(({ data }) => data),
)(App);
