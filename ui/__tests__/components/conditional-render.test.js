import { shallow } from 'enzyme';
import React from 'react';

import ConditionalRender from '../../components/conditional-render';


describe('<ConditionalRender />', () => {
  const el = (
    <ConditionalRender>
      <div className="first" />
      <div className="second" />
    </ConditionalRender>
  );

  it('renders the first child when not clientSide', () => {
    const rendered = shallow(el, { disableLifecycleMethods: true });
    expect(rendered.prop('className')).toEqual('first');
  });
  it('renders the second child when doing a full componentDidMount', () => {
    const rendered = shallow(el);
    expect(rendered.prop('className')).toEqual('second');
  });
});
