import { shallow } from 'enzyme';
import React from 'react';

import { Footnotes } from '../../../components/document/footnotes';
import DocumentNode from '../../../util/document-node';

describe('<Footnotes />', () => {
  it('includes the id', () => {
    const result = shallow(<Footnotes footnotes={[]} id="ididid" />);
    expect(result.prop('id')).toBe('ididid');
  });
  it('renders footnotes at the bottom', () => {
    const footnotes = [
      new DocumentNode({ identifier: '1' }),
      new DocumentNode({ identifier: '2' }),
      new DocumentNode({ identifier: '3' }),
    ];
    const result = shallow(<Footnotes footnotes={footnotes} id="" />);
    expect(result.hasClass('bottom-footnotes')).toBe(true);
    const components = result.find('Footnote');
    expect(components).toHaveLength(3);
    expect(components.at(0).prop('docNode').identifier).toBe('1');
    expect(components.at(1).prop('docNode').identifier).toBe('2');
    expect(components.at(2).prop('docNode').identifier).toBe('3');
  });
});
