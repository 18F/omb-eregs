import { shallow } from 'enzyme';
import React from 'react';

import { ThingCounter } from '../../components/thing-counters';

function makeReqThing(count, query = null) {
  const params = {
    count,
    plural: 'requirements',
    router: { pathname: '', query: query || {} },
    singular: 'requirement',
  };
  return shallow(<ThingCounter {...params} />);
}

describe('<ThingCounter />', () => {
  it('states zero results when there are no results', () => {
    const result = makeReqThing(0);
    expect(result.text()).toMatch(/No requirements match your search, try removing some filters to see more results./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(1);
  });
  it('states one result when there is one filtered result', () => {
    const result = makeReqThing(1, { topic: 'something' })
    expect(result.text()).toMatch(/1 requirement matches your search./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two results when there are two filtered results', () => {
    const result = makeReqThing(2, { topic: 'something' });
    expect(result.text()).toMatch(/2 requirements match your search./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states one total result when there is one total result', () => {
    const result = makeReqThing(1);
    expect(result.text()).toMatch(/1 requirement\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two total results when there are two total results', () => {
    const result = makeReqThing(2);
    expect(result.text()).toMatch(/2 requirements\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two total results when there are two total results, even with a page parameter present', () => {
    const result = makeReqThing(2, { page: '1' });
    expect(result.text()).toMatch(/2 requirements\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two total results when there are two total results, even with an empty parameter present', () => {
    const result = makeReqThing(2, { topics_id__in: '' });
    expect(result.text()).toMatch(/2 requirements\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });
  it('states two total results when there are two total results, even with multiple empty parameters present', () => {
    const result = makeReqThing(2, { topics__id__in: '', req_id: '' });
    expect(result.text()).toMatch(/2 requirements\./);
    expect(result.find("div")).toHaveLength(1);
    expect(result.find(".alert .p1 .m1 .border")).toHaveLength(0);
  });

});

