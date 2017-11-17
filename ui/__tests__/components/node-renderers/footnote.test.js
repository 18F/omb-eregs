import { shallow } from 'enzyme';
import React from 'react';

import Footnote from '../../../components/node-renderers/footnote';
import nodeFactory from '../../test-utils/node-factory';
import {
  itIncludesNodeText,
  itIncludesTheIdentifier,
} from '../../test-utils/node-renderers';

describe('<Footnote />', () => {
  itIncludesNodeText(Footnote);
  itIncludesTheIdentifier(Footnote);
  it('includes the marker', () => {
    const params = {
      children: [],
      docNode: nodeFactory({ marker: '8' }),
    };
    const result = shallow(<Footnote {...params} />);

    const marker = result.children().first();
    expect(marker.text()).toBe('8');
  });
});

