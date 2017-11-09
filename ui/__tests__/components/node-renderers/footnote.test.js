import { shallow } from 'enzyme';
import React from 'react';
import Footnote from '../../../components/node-renderers/footnote';
import {
  itIncludesNodeText,
  itIncludesTheIdentifier,
} from '../../test-utils/node-renderers';

describe('<Footnote />', () => {
  itIncludesNodeText(Footnote);
  itIncludesTheIdentifier(Footnote);
  it('includes the marker', () => {
    const docNode = { children: [], identifier: '', marker: '8' };
    const result = shallow(<Footnote docNode={docNode} />);

    const marker = result.children().first();
    expect(marker.text()).toBe('8');
  });
});

