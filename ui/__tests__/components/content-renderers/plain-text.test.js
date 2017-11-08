import { shallow } from 'enzyme';
import React from 'react';
import PlainText from '../../../components/content-renderers/plain-text';


describe('<PlainText />', () => {
  it('includes only and all of the text of the content', () => {
    const content = { text: 'Some text here\n' };
    const text = shallow(<PlainText content={content} />).text();
    expect(text).toEqual('Some text here\n');
  });
});
