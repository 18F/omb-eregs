import { mount } from 'enzyme';
import React from 'react';

import Disclaimer from '../../components/disclaimer';


describe('<Disclaimer />', () => {
  function expectToBeClosed(el) {
    expect(el.text()).toMatch(/See more/);
    expect(el.find('.usa-disclaimer-text').length).toEqual(
      el.find('noscript .usa-disclaimer-text').length);
  }
  function expectToBeOpen(el) {
    expect(el.text()).toMatch(/See less/);
    expect(el.find('.usa-disclaimer-text').length).not.toEqual(
      el.find('noscript .usa-disclaimer-text').length);
  }

  it('starts closed but can be toggled', () => {
    const el = mount(React.createElement(Disclaimer));
    expectToBeClosed(el);

    el.find('button').simulate('click');
    expectToBeOpen(el);

    el.find('button').simulate('click');
    expectToBeClosed(el);
  });
});
