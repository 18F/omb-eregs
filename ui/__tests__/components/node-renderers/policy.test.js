import { shallow } from 'enzyme';
import React from 'react';

import Policy from '../../../components/node-renderers/policy';
import {
  itIncludesTheIdentifier,
  itRendersChildNodes,
} from '../../test-utils/node-renderers';

jest.mock('../../../util/render-node');

describe('<Policy />', () => {
  const policy = {
    issuance_pretty: 'March 3, 2003',
    omb_policy_id: 'M-44-55',
    original_url: 'http://example.com/thing.pdf',
    title: 'Magistrate',
  };
  itIncludesTheIdentifier(Policy, { policy });
  itRendersChildNodes(Policy, { policy });

  it('uses the policy for default text', () => {
    const docNode = {
      children: [],
      identifier: '',
      policy,
      text: '',
    };
    const result = shallow(<Policy docNode={docNode} />);
    const text = result.text();
    expect(text).toMatch(/M-44-55/);
    expect(text).toMatch(/Magistrate/);
    expect(text).toMatch(/March 3, 2003/);

    expect(result.find('Link').first().prop('href')).toEqual(
      'http://example.com/thing.pdf');
  });
  it('can grab text from subnodes', () => {
    const docNode = {
      children: [
        { children: [], node_type: 'other', text: 'other-text' },
        { children: [], node_type: 'subject', text: 'subject-here' },
        { children: [], node_type: 'policyNum', text: 'some-m-number' },
        { children: [], node_type: 'published', text: 'some date here' },
        { children: [], node_type: 'policyTitle', text: 'a title!' },
      ],
      identifier: '',
      policy,
      text: '',
    };

    const result = shallow(<Policy docNode={docNode} />);
    const text = result.text();
    expect(text).not.toMatch(/M-44-55/);
    expect(text).not.toMatch(/Magistrate/);
    expect(text).not.toMatch(/March 3, 2003/);
    expect(text).toMatch(/subject-here/);
    expect(text).toMatch(/some-m-number/);
    expect(text).toMatch(/some date here/);
    expect(text).toMatch(/a title!/);
    expect(text).not.toMatch(/other-text/); // not specifically searched for
  });
});
