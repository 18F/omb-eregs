import { shallow } from 'enzyme';
import React from 'react';

import FootnoteCitationInTable from '../../../components/content-renderers/footnote-citation-in-table';

describe('<FootnoteCitationInTable />', () => {
  const content = {
    footnote_node: { identifier: 'some__identifier' },
    text: 'some text, like "1"',
  };
  const result = shallow(<FootnoteCitationInTable content={content} />);
  const link = result.find('Link');

  it('includes the correct link', () => {
    expect(link).toHaveLength(1);
    expect(link.prop('href')).toBe('#some__identifier-table');
  });
  it('includes the correct text', () => {
    expect(link.children().text()).toBe('some text, like "1"');
  });
});
