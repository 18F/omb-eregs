import React from 'react';
import { shallow } from 'enzyme';

import { AjaxLoadingResolver, wrapWithAjaxLoader } from '../../components/ajax-loading';

describe('wrapWithAjaxLoader', () => {
  it('creates an AjaxLoadingResolver', () => {
    const result = React.createElement(
      wrapWithAjaxLoader(null, { ajax: 'fn' }, 123), { some: 'props' });
    const el = shallow(result);
    expect(el.name()).toEqual('AjaxLoadingResolver');
    expect(el.prop('props')).toEqual({ some: 'props' });
    expect(el.prop('height')).toEqual(123);
    expect(el.prop('resolve')).toEqual({ ajax: 'fn' });
  });
  it('passes the resolved data', () => {
    const result = React.createElement(
      wrapWithAjaxLoader('div', { ajax: 'wouldGoHere' }),
      { className: 'classy' });
    const child = shallow(result).prop('children')({ resolved: 'data' });

    const el = shallow(child);
    expect(el.name()).toEqual('div');
    expect(el.prop('className')).toEqual('classy');
    expect(el.prop('resolved')).toEqual('data');
  });
});

describe('AjaxLoadingResolver', () => {
  it('displays a spinner until loaded', () => {
    const childFn = () => React.createElement('div');
    // We've overriding methods to be constant, so we won't reference "this"
    /* eslint-disable class-methods-use-this */
    class PendingResolver extends AjaxLoadingResolver {
      isPending() { return true; }
    }
    class ResolvedResolver extends AjaxLoadingResolver {
      isPending() { return false; }
    }
    /* eslint-enable class-methods-use-this */

    const spinner = shallow(React.createElement(PendingResolver, {}, childFn));
    expect(spinner.name()).toEqual('Spinner');

    const resolved = shallow(React.createElement(ResolvedResolver, {}, childFn));
    expect(resolved.name()).toEqual('div');
  });
});
