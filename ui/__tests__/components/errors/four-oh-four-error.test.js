import { shallow } from 'enzyme';
import React from 'react';

import FourOhFour from '../../../components/errors/four-oh-four-error';

describe('<FourOhFour />', () => {
  it('has expected milestones', () => {
    const wrapped = shallow(<FourOhFour />);
    expect(wrapped.name()).toBe('HeaderFooter');
    const text = wrapped.childAt(0).text();
    expect(text).toMatch(/We can’t find the page/); // note the smart quote
    expect(text).toMatch(/contact us/);
    expect(text).toMatch(/Return home/);
  });
});
