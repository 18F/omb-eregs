import { mount, shallow } from 'enzyme';
import React from 'react';

import config from '../../config';
import ConditionalRender from '../../components/conditional-render';

jest.mock('../../config');


describe('<ConditionalRender />', () => {
  const el = React.createElement(
    ConditionalRender,
    {},
    React.createElement('div', { className: 'first' }),
    React.createElement('div', { className: 'second' }));

  it('renders the first child when not clientSide', () => {
    config.clientSide = false;
    expect(shallow(el).prop('className')).toEqual('first');
  });
  it('renders the second child when clientSide', () => {
    config.clientSide = true;
    expect(shallow(el).prop('className')).toEqual('second');
  });
  it('renders the second child when doing a full componentDidMount', () => {
    config.clientSide = false;
    expect(mount(el).find('div').prop('className')).toEqual('second');
  });
});
