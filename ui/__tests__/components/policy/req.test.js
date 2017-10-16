import { shallow, mount } from 'enzyme';
import React from 'react';

import Req from '../../../components/policy/req';

describe('<Req />', () => {
  const req = {
    req_id: '123.45',
    req_text: 'Some text here',
    topics: [],
    policy: [],
  };

  it('includes meta data when highlighted', () => {
    const normalText = mount(
      <Req href="" onClick={jest.fn()} req={req} />,
    ).text();
    const hlText = mount(
      <Req highlighted href="" onClick={jest.fn()} req={req} />,
    ).text();

    expect(normalText).toMatch(/Some text here/);
    expect(normalText).not.toMatch(/123.45/);
    expect(hlText).toMatch(/Some text here/);
    expect(hlText).toMatch(/123.45/);
  });

  it('includes an anchor with the correct data', () => {
    const onClick = jest.fn();
    req.req_id = '1.1';
    req.req_text = 'Text goes here';
    const anchors = shallow(
      <Req href="/some/location" onClick={onClick} req={req} />,
    ).find('a');
    expect(anchors).toHaveLength(1);

    const anchor = anchors.first();
    expect(anchor.prop('href')).toEqual('/some/location');
    expect(anchor.prop('onClick')).toBe(onClick);
  });
});
