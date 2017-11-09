import { shallow } from 'enzyme';
import React from 'react';

import { Document } from '../../pages/document';
import DocumentNode from '../../util/document-node';
import renderNode from '../../util/render-node';

jest.mock('../../util/render-node');

describe('<Document />', () => {
  it('calls renderNode with a DocumentNode', () => {
    renderNode.mockImplementationOnce(() => <span>Stuff</span>);
    const docNode = { children: [], some: 'thing' };
    const result = shallow(<Document docNode={docNode} />);
    expect(result.text()).toBe('Stuff');
    expect(renderNode).toHaveBeenCalledTimes(1);
    expect(renderNode).toHaveBeenCalledWith(new DocumentNode(docNode));
  });
});
