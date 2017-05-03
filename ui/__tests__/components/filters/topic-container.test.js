import { mount } from 'enzyme';
import React from 'react';

import { TopicContainer } from '../../../components/filters/topic-container';
import mockRouter from '../../util/mockRouter';


describe('<TopicContainer />', () => {
  it('works when there is no existing filter', () => {
    const params = { existingTopics: [], paramName: 'someField' };
    const context = { router: mockRouter({
      pathname: '/policies', query: { other: 'args' },
    }) };
    const rendered = mount(
      React.createElement(TopicContainer, params), { context });

    expect(rendered.find('FilterRemoveView')).toHaveLength(0);
    expect(rendered.find('Autocompleter')).toHaveLength(1);
  });
});

describe('<TopicContainer /> with common setup', () => {
  const params = {
    existingTopics: [
      { id: 1, name: 'a' }, { id: 7, name: 'b' }, { id: 10, name: 'c' },
    ],
    paramName: 'someField',
  };
  const context = { router: mockRouter({
    pathname: '/policies', query: { some: 'stuff', someField: '1,7,10' },
  }) };
  const rendered = mount(
    React.createElement(TopicContainer, params), { context });

  it('contains the correct number of FilterRemoveViews', () => {
    expect(rendered.find('FilterRemoveView')).toHaveLength(3);
  });

  it('contains an autocompleter', () => {
    expect(rendered.find('DoesNotExist')).toHaveLength(0);
    expect(rendered.find('Autocompleter')).toHaveLength(1);
  });

  it('contains the correct names', () => {
    const removes = rendered.find('FilterRemoveView');
    expect(removes.at(0).prop('name')).toEqual('a');
    expect(removes.at(1).prop('name')).toEqual('b');
    expect(removes.at(2).prop('name')).toEqual('c');
  });

  it('contains the correct links', () => {
    const removes = rendered.find('FilterRemoveView');
    expect(removes.at(0).prop('linkToRemove')).toEqual({
      pathname: '/policies', query: { some: 'stuff', someField: '7,10' } });
    expect(removes.at(1).prop('linkToRemove')).toEqual({
      pathname: '/policies', query: { some: 'stuff', someField: '1,10' } });
    expect(removes.at(2).prop('linkToRemove')).toEqual({
      pathname: '/policies', query: { some: 'stuff', someField: '1,7' } });
  });
});
