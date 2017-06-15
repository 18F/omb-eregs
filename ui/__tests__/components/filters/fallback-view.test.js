import { shallow } from 'enzyme';
import React from 'react';

import FallbackView from '../../../components/filters/fallback-view';


describe('<FallbackView /> form', () => {
  const props = {
    insertParam: 'someParam',
    lookup: 'topics',
    pathname: '/policies',
    query: { some: 'thing', more: 'params', et: 'c' },
  };
  const result = shallow(React.createElement(FallbackView, props));

  it('creates a form with the correct url', () => {
    expect(result.prop('action')).toEqual('/search-redirect/topics/');
    expect(result.prop('method')).toEqual('GET');
  });

  it('contains a hidden element for each param', () => {
    const some = result.find('input[name="redirectQuery__some"]').first();
    const more = result.find('input[name="redirectQuery__more"]').first();
    expect(some.prop('type')).toEqual('hidden');
    expect(some.prop('value')).toEqual('thing');
    expect(more.prop('value')).toEqual('params');
  });
});

