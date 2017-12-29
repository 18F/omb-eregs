import { shallow } from 'enzyme';
import React from 'react';

import ListItem from '../../../components/node-renderers/list-item';
import DocumentNode from '../../../util/document-node';
import {
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<ListItem />', () => {
  itIncludesTheIdentifier(ListItem);
  itRendersChildNodes(ListItem);
  it('includes the marker', () => {
    const docNode = new DocumentNode({ marker: 'c.!!!' });
    const text = shallow(<ListItem docNode={docNode} />).text();
    expect(text).toMatch(/c\.!!!/);
  });
  it('includes the title if present', () => {
    const docNode = new DocumentNode({ title: 'Some title' });
    const result = shallow(<ListItem docNode={docNode} />).find('.list-item-title');
    expect(result).toHaveLength(1);
    expect(result.text()).toBe('Some title');
  });
  it('does not include a title if not present', () => {
    const docNode = new DocumentNode();
    const result = shallow(<ListItem docNode={docNode} />).find('.list-item-title');
    expect(result).toHaveLength(0);
  });
});

