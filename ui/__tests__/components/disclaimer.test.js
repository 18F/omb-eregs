import { mount } from 'enzyme';
import React from 'react';

import Disclaimer from '../../components/disclaimer';


describe('<Disclaimer />', () => {
  describe('returns the right contents', () => {
    it('returns the right contents', () => {
      const result = mount(<Disclaimer />);
      expect(result.find('div').length).toEqual(3);
      expect(result.find('img.usa-disclaimer-flag').length).toEqual(1);
      expect(result.find('a').length).toEqual(1);
      expect(result.find('a[href="mailto:ofcio@omb.eop.gov"]').length).toEqual(1);
    });
  });

});
