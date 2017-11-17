import { shallow } from 'enzyme';
import React from 'react';

import Heading from '../../../components/node-renderers/heading';
import nodeFactory from '../../test-utils/node-factory';
import {
  itIncludesNodeText,
  itIncludesTheIdentifier,
} from '../../test-utils/node-renderers';

describe('<Heading />', () => {
  itIncludesNodeText(Heading);
  itIncludesTheIdentifier(Heading);
  it('generates an h1 when there are no sections', () => {
    const docNode = nodeFactory({ identifier: 'aaa_1__bbb_2__ccc_3' });
    const result = shallow(<Heading docNode={docNode} />);
    expect(result.name()).toBe('h1');
  });
  it('generates an h4 if there are three sections', () => {
    const docNode = nodeFactory({
      identifier: 'root_1__sec_4__sec_a__appendix_A__sec_3__heading_1',
    });
    const result = shallow(<Heading docNode={docNode} />);
    expect(result.name()).toBe('h4');
  });
});
