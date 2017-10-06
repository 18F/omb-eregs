import { shallow } from 'enzyme';
import React from 'react';

import Metadata from '../../../components/requirements/metadata';

describe('<Metadata />', () => {
  const basic = shallow(
    <Metadata className="something-hyphenated" name="IAmAKey" value="IAmAValue" />,
  );
  it('renders', () => {
    expect(basic.type()).toBe('div');
  });
  it('has the right classes', () => {
    expect(basic.props().className).toMatch('something-hyphenated metadata');
  });
  it('has the right text content', () => {
    expect(basic.text()).toMatch('IAmAKey: IAmAValue');
  });

  const separated = shallow(
    <Metadata
      className="something-hyphenated"
      name="IAmAKey"
      value="IAmAValue"
      separator=" I separate things "
    />,
  );
  it('has the right text content with separator', () => {
    expect(separated.text()).toMatch('IAmAKey I separate things IAmAValue');
  });

  const noValue = shallow(<Metadata className="something-hyphenated" name="IAmAKey" value="" />);
  it('returns null when value and nullValue are null', () => {
    expect(noValue.type()).toBe(null);
  });

  const noValueAlt = shallow(
    <Metadata
      className="something-hyphenated"
      name="IAmAKey"
      value=""
      nullValue="Show this instead"
    />,
  );
  it('renders if nullValue is present', () => {
    expect(noValueAlt.type()).toBe('div');
  });
  it('shows the nullValue content', () => {
    expect(noValueAlt.text()).toMatch('Show this instead');
  });
});
