import { shallow } from 'enzyme';

import pageTitle from '../../util/page-title';

describe('pageTitle', () => {
  it('generates a "Head" component', () => {
    const result = shallow(pageTitle());
    expect(result.name()).toBe('Head');
  });
  it('has a default', () => {
    const result = shallow(pageTitle());
    expect(result.children().text()).toBe('OMB Policy Library (Beta)');
  });
  it('displays title first', () => {
    const result = shallow(pageTitle('AAA BB'));
    expect(result.children().text()).toBe('AAA BB | OMB Policy Library (Beta)');
  });
});
