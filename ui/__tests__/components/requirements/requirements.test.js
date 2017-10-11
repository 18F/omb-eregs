import { mount } from 'enzyme';
import React from 'react';

import Requirement from '../../../components/requirements/requirement';

describe('<Requirement />', () => {
  const baseReq = {
    req_id: '1.1',
    req_text: '',
    policy: { id: 10, title_with_number: 'fake-text' },
    topics: [],
  };

  it('links to the related policy', () => {
    const req = Object.assign({}, baseReq, {
      policy: { id: 4, title_with_number: 'Some Title Here' },
    });

    const result = mount(<Requirement requirement={req} />);
    const link = result.find('.policy-title LinkRoutes').first();

    expect(link.text()).toEqual('Some Title Here');
    expect(link.prop('route')).toEqual('policies');
    expect(link.prop('params')).toEqual({ id__in: 4 });
  });

  it('includes links to topics', () => {
    const req = Object.assign({}, baseReq, {
      topics: [
        { id: 6, name: 'Six' }, { id: 8, name: 'Eight' },
      ],
    });

    const result = mount(<Requirement requirement={req} />);
    const links = result.find('.topics LinkRoutes');

    expect(links).toHaveLength(2);
    const [six, eight] = [links.first(), links.last()];
    expect(six.text()).toEqual('Six');
    expect(six.prop('params').topics__id__in).toEqual(6);
    expect(eight.prop('route')).toEqual('requirements');
  });

  it('filters out values in the "applies to" field', () => {
    const hasEntity = Object.assign({}, baseReq, {
      impacted_entity: 'A Value that has NA in it',
    });
    const hasNA = Object.assign({}, baseReq, {
      impacted_entity: '   nA',
    });

    let result = mount(<Requirement requirement={hasEntity} />);
    expect(result.find('.applies-to').first().text()).toEqual(
      'Applies to: A Value that has NA in it');

    result = mount(<Requirement requirement={hasNA} />);
    expect(result.find('.applies-to')).toHaveLength(0);
  });
});
