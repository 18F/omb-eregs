import { shallow } from 'enzyme';
import React from 'react';

import { PrivacyView } from '../../pages/privacy';


describe('<PrivacyView />', () => {
  it('renders without an error', () => {
    const result = shallow(<PrivacyView />);
    expect(result).toBeDefined();
  });
  it('has the right header', () => {
    const result = shallow(<PrivacyView />);
    expect(result.find('h2').length).toEqual(1);
    expect(result.find('h2').text()).toEqual('Privacy Policy');
  });
});
