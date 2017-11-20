import { shallow } from 'enzyme';
import React from 'react';

import Footnote from '../../../components/node-renderers/footnote';
import DocumentNode from '../../../util/document-node';
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
      docNode: new DocumentNode({ marker: '8' }),
    };
    const result = shallow(<Footnote {...params} />);

    const marker = result.children().first();
    expect(marker.text()).toBe('8');
  });
});

