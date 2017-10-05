import { shallow } from 'enzyme';
import React from 'react';

import UnexpectedError from '../../../components/errors/unexpected-error';

describe('<UnexpectedError />', () => {
  it('has the correct status code', () => {
    const text = shallow(<UnexpectedError statusCode={502} />).text();
    expect(text).toMatch(/Bad Gateway/);
    expect(text).not.toMatch(/Unexpected error/);
    expect(text).toMatch(/homepage/);
    expect(text).toMatch(/contact us/);
  });

  it('works without a status code', () => {
    const text = shallow(<UnexpectedError />).text();
    expect(text).not.toMatch(/Bad Gateway/);
    expect(text).toMatch(/Unexpected error/);
    expect(text).toMatch(/homepage/);
    expect(text).toMatch(/contact us/);
  });
});
