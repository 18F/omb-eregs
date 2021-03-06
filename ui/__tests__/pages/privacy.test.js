import { shallow } from 'enzyme';
import Head from 'next/head';
import React from 'react';

import { PrivacyView } from '../../pages/privacy';


describe('<PrivacyView />', () => {
  it('renders without an error', () => {
    const result = shallow(<PrivacyView />);
    expect(result).toBeDefined();
  });
  it('has the right header', () => {
    const result = shallow(<PrivacyView />);
    expect(result.find('h2')).toHaveLength(1);
    expect(result.find('h2').text()).toEqual('Privacy Policy');
  });
  it('sets the page title', () => {
    const result = shallow(<PrivacyView />).find(Head);
    expect(result).toHaveLength(1);
    expect(result.children().text()).toMatch(/Privacy Policy/);
  });
});
