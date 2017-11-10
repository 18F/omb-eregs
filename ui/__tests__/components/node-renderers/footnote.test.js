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
    const params = {
      children: [],
      docNode: {
        children: [],
        content: [],
        identifier: '',
        type_emblem: '8',
        text: 'test the content around',
      },
    };
    const result = shallow(<Footnote {...params} />);

    const marker = result.children().first();
    expect(marker.text()).toBe('8');
  });

  it('Properlly displays footnote_node content', () => {
    const params = {
      docNode: {
        children: [],
        content: [],
        identifier: '',
        type_emblem: '10',
      },
    };
    const result = shallow(<Footnote {...params}>test the content around</Footnote>);

    expect(result.html()).toMatch(/test the content around/);
  });
});

