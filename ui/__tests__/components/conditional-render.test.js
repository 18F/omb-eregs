import { mount, shallow } from 'enzyme';
import React from 'react';
import ConditionalRender from '../../components/conditional-render';


describe('<ConditionalRender />', () => {
  const el = React.createElement(
    ConditionalRender,
    {},
    React.createElement('div', { className: 'first' }),
    React.createElement('div', { className: 'second' }));

  it('renders the first child when not clientSide', () => {
    expect(shallow(el).prop('className')).toEqual('first');
  });
  it('renders the second child when doing a full componentDidMount', () => {
    expect(mount(el).find('div').prop('className')).toEqual('second');
  });
});
