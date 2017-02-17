import React, { Component } from 'react';
import './App.css';
import Api from './Api'

const KeywordUrl = 'https://omb-eregs-dev.app.cloud.gov/taggit_autosuggest/list/reqs.keyword'

function Keyword(props) {
  return <li>{props.keyword}</li>
}

class Keywords extends Component {
  constructor(props) {
    super(props);
    this.state = {keywords: ['thing', 'stuff']};
  }

  componentDidMount() {
    Api.getItems(KeywordUrl).then((data) => {
      this.setState({
        keywords: data
      });
    });
  }

  render() {
    return (
      <div>
        <h1>Keywords</h1>
        <ul>
          {this.state.keywords.map((keyword) => <Keyword key={keyword.name} keyword={keyword.name} />)}
        </ul>
      </div>
    );
  }

}

export default Keywords;
