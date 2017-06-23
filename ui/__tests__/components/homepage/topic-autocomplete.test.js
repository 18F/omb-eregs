import { shallow } from 'enzyme';
import React from 'react';

import TopicAutocomplete from '../../../components/homepage/topic-autocomplete';

describe('<TopicAutocomplete />', () => {
  it('saves state', () => {
    const el = shallow(React.createElement(TopicAutocomplete));
    expect(el.state('value')).toEqual([]);
    expect(el.find('Async').prop('value')).toEqual([]);

    el.find('Async').simulate('change', [1, 3, 5]);
    expect(el.state('value')).toEqual([1, 3, 5]);
    expect(el.find('Async').prop('value')).toEqual([1, 3, 5]);
  });
});
