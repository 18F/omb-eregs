import { mount } from 'enzyme';
import React from 'react';
import { createStore } from 'redux';

import initialState from '../../store/initial-state';
import withScrollTracking from '../../util/with-scroll-tracking';

function MyComponent() {
  return <div>Not seen</div>;
}

describe('withScrollTracking', () => {
  const startState = {
    ...initialState,
    tableOfContents: {
      identifier: 'root',
      children: [
        { identifier: 'child-1', children: [] },
        { identifier: 'child-2', children: [] },
      ],
    },
  };

  it('does not wrap components which are not in the toc', () => {
    const Wrapped = withScrollTracking(MyComponent);
    const store = createStore(state => state, startState);
    const result = mount(<Wrapped id="not-in-toc" store={store} />);
    // 2 levels of HOC: React-Redux, WithScrollTracking
    expect(result.children().children().type()).toBe(MyComponent);
  });
  it('wraps toc components with Waypoint', () => {
    const Wrapped = withScrollTracking(MyComponent);
    const store = createStore(state => state, startState);
    const result = mount(<Wrapped id="child-1" store={store} />);
    // 2 levels of HOC: React-Redux, WithScrollTracking
    expect(result.children().children().name()).toBe('Waypoint');
  });
});
