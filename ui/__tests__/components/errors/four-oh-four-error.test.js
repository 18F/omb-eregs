import { shallow } from 'enzyme';
import React from 'react';

import FourOhFour from '../../../components/errors/four-oh-four-error';

describe('<FourOhFour />', () => {
  it('has expected milestones', () => {
    const result = shallow(<FourOhFour />).children().first();
    expect(result.text()).toMatch(/We can’t find the page/); // note the smart quote
    expect(result.find('Link')).toHaveLength(2);
    expect(result.find('Link').at(0).children().text()).toBe('homepage');
    expect(result.find('Link').at(1).children().text()).toBe('Return home');
    expect(result.find('ContactEmail')).toHaveLength(1);
  });
});
