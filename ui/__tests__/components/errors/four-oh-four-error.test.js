import { shallow } from 'enzyme';
import React from 'react';

import FourOhFour from '../../../components/errors/four-oh-four-error';

describe('<FourOhFour />', () => {
  it('has expected milestones', () => {
    const result = shallow(<FourOhFour />).children().first();
    expect(result.text()).toMatch(/We can’t find the page/); // note the smart quote
    expect(result.find('Link')).toHaveLength(3);
    expect(result.find('Link').at(1).children().text()).toBe('contact us');
    expect(result.find('Link').at(2).children().text()).toBe('Return home');
  });
});
