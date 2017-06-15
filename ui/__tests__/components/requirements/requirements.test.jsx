import { mount } from 'enzyme';
import React from 'react';

import Requirement from '../../../components/requirements/requirement';

describe('<Requirement />', () => {
  it('includes links to topics', () => {
    const req = {
      req_id: '1.1',
      req_text: '',
      policy: { sunset: null },
      topics: [
        { id: 6, name: 'Six' }, { id: 8, name: 'Eight' },
      ],
    };

    const result = mount(<Requirement requirement={req} />);
    const links = result.find('Link');

    expect(links).toHaveLength(2);
    const [six, eight] = [links.first(), links.last()];
    expect(six.text()).toEqual('Six');
    expect(six.prop('to').query.topics__id__in).toEqual(6);
    expect(eight.prop('to').pathname).toEqual('/requirements');
  });
});
