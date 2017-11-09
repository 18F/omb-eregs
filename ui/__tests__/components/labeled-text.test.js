import { shallow } from 'enzyme';
import React from 'react';
import LabeledText from '../../components/labeled-text';

describe('<LabeledText />', () => {
  const result = shallow(
    <LabeledText id="an_id" label="Some Label">Text text</LabeledText>);
  it('has an accessible id', () => {
    expect(result.find('label').prop('htmlFor')).toBe('an_id');
    expect(result.find('span').prop('id')).toBe('an_id');
  });
  it('displays a label', () => {
    expect(result.find('label').text()).toBe('Some Label');
  });
  it('includes a span with the text', () => {
    expect(result.find('span').text()).toBe('Text text');
  });
});
