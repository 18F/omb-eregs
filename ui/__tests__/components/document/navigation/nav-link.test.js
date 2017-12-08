import { shallow } from 'enzyme';
import React from 'react';

import { NavLink } from '../../../../components/document/navigation/nav-link';

describe('<NavLink />', () => {
  it('displays children', () => {
    const result = shallow(
      <NavLink identifier="" title="">
        <div>Some things</div>
        <span>More</span>
      </NavLink>);
    expect(result.text()).toMatch(/Some thingsMore/);
  });
  it('includes appropriate text', () => {
    const result = shallow(<NavLink identifier="" title="ttt" />);
    expect(result.find('Link').children().text()).toBe('ttt');
  });
  it('links to the right place', () => {
    const result = shallow(<NavLink identifier="ididid" title="" />);
    expect(result.find('Link').prop('href')).toBe('#ididid');
  });
  it('has an active state', () => {
    const nonActive = shallow(<NavLink identifier="" title="" />);
    expect(nonActive.find('Link').hasClass('active')).toBe(false);
    const active = shallow(<NavLink active identifier="" title="" />);
    expect(active.find('Link').hasClass('active')).toBe(true);
  });
});
