import { shallow } from 'enzyme';
import React from 'react';

import config from '../../config';
import Error from '../../components/error';

jest.mock('../../config');

describe('<Error />', () => {
  const error = {
    stack: ['Line 1', 'A second line', 'The third'].join('\n'),
  };

  it('includes a stacktrace when debugging', () => {
    config.debug = true;
    const lis = shallow(<Error err={error} />).find('li');
    expect(lis).toHaveLength(3);
  });
  it('does not include a stack trace when not debugging', () => {
    config.debug = false;
    const lis = shallow(<Error err={error} />).find('li');
    expect(lis).toHaveLength(0);
  });
});
