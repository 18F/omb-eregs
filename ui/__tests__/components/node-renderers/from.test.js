import { shallow } from 'enzyme';
import React from 'react';

import From from '../../../components/node-renderers/from';

describe('<From />', () => {
  it('prepares an appropriate LabeledText', () => {
    const docNode = { marker: 'MmMm', text: 'Some text here' };
    const result = shallow(<From docNode={docNode} />);
    expect(result.name()).toEqual('LabeledText');
    expect(result.prop('id')).toEqual('from');
    expect(result.prop('label')).toEqual('MmMm');
    expect(result.children().text()).toEqual('Some text here');
  });
});
