import { mount } from 'enzyme';
import PropTypes from 'prop-types';
import React from 'react';
import { createStore } from 'redux';

import initialState from '../../store/initial-state';
import withScrollTracking from '../../util/with-scroll-tracking';

function MyComponent({ docNode }) {
  return docNode.identifier;
}
MyComponent.propTypes = {
  docNode: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
  }).isRequired,
};

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
    const docNode = { identifier: 'not-in-toc' };
    const Wrapped = withScrollTracking(MyComponent);
    const store = createStore(state => state, startState);
    const result = mount(<Wrapped docNode={docNode} store={store} />);
    // 2 levels of HOC: React-Redux, WithScrollTracking
    expect(result.children().children().type()).toBe(MyComponent);
  });
  it('wraps toc components with Waypoint', () => {
    const docNode = { identifier: 'child-1' };
    const Wrapped = withScrollTracking(MyComponent);
    const store = createStore(state => state, startState);
    const result = mount(<Wrapped docNode={docNode} store={store} />);
    // 2 levels of HOC: React-Redux, WithScrollTracking
    expect(result.children().children().name()).toBe('Waypoint');
  });
});
