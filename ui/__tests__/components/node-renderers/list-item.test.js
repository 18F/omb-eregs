import { shallow } from 'enzyme';
import React from 'react';
import ListItem from '../../../components/node-renderers/list-item';
import {
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<ListItem />', () => {
  itIncludesTheIdentifier(ListItem);
  itRendersChildNodes(ListItem);
  it('includes the marker', () => {
    const docNode = { children: [], identifier: '', marker: 'c.!!!' };
    const text = shallow(<ListItem docNode={docNode} />).text();
    expect(text).toMatch(/c\.!!!/);
  });
});

