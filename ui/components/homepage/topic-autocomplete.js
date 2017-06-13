import React from 'react';
import { Async } from 'react-select';

import { makeOptionLoader } from '../../lookup-search';


export default class TopicAutocomplete extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { value: [] };
  }

  render() {
    return React.createElement(Async, {
      joinValues: true,
      loadOptions: makeOptionLoader('topics'),
      multi: true,
      name: 'topics__id__in',
      onChange: value => this.setState({ value }),
      placeholder: 'Shared services, IT management, ...',
      value: this.state.value,
    });
  }
}
