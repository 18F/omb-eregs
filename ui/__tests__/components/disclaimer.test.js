import { mount } from 'enzyme';
import React from 'react';

import Disclaimer from '../../components/disclaimer';
import { email } from '../../components/contact-email';

describe('<Disclaimer />', () => {
  describe('returns the right contents', () => {
    it('has the right number of div elements', () => {
      const result = mount(<Disclaimer />);
      expect(result.find('div').length).toEqual(3);
    });
    it('has the disclaimer-flag img element', () => {
      const result = mount(<Disclaimer />);
      expect(result.find('img.usa-disclaimer-flag').length).toEqual(1);
    });
    it('has the right contact email', () => {
      const result = mount(<Disclaimer />);
      expect(result.find('a').length).toEqual(1);
      expect(result.find(`a[href="mailto:${email}"]`).text()).toEqual(`Email ${email}`);
    });
  });

});
